#!/usr/bin/env python3
"""
MileSprout Perks: seeded Monte Carlo, agent-based simulation (standard library only).

Run:  python3 sim.py            (writes CSVs next to this file, ~1-2 minutes)

WHAT THIS IS
  1,000 simulated drivers, 13 weeks (about 3 months, January to March), 12 perk
  categories. Every input below is an ASSUMPTION, chosen to be plausible and
  written down so it can be argued with. Nothing here is measured data. Use the
  outputs to compare options (30 vs 60 minutes, caps, ladders), not as forecasts.

MODEL IN ONE PARAGRAPH
  Each driver gets a country, work type (which fixes the vehicle), shift pattern,
  hours, income band, urban/rural, diet, coffee habit, coupon attitude and Pro
  status. Each category gets a utility in [0, 1]: base weight by work type, times
  modifiers for country, shift, income, coffee habit and diet, times log-normal
  noise. In-store categories: every shift has a chance of a "parked between jobs
  near a partner" moment (if a partner covers the driver's area). The driver
  sees the offer if they opened the Perks tab that week (falls with novelty
  decay) or a contextual card shows. They then want it with probability utility
  x attitude x K. Park to claim blocks some claims (the phone thinks they're
  moving); some retry. The code can expire inside the window (busier shifts
  expire more). Per-partner cap per week. Online categories: a monthly "need"
  chance (tax only in tax season), redeemed if the driver saw the offer that
  month. Partner side: each driver is already a customer of the category's
  partner with prior chance q. Existing customers visit anyway with weekly
  probability V; a redemption in a week they'd have visited anyway is
  cannibalised. Net-new customers who redeem pick up an organic weekly return
  chance H. 10% of drivers are a holdout who get no offers. Incremental visits =
  treated visits minus holdout visits (and the model's true counterfactual, to
  show how noisy a 10% holdout is).
"""
import csv
import math
import os
import random
import statistics
from collections import defaultdict

OUT = os.path.dirname(os.path.abspath(__file__))
N_DRIVERS = 1000
WEEKS = 13
MONTHS = 3
WPM = WEEKS / MONTHS
START_MONTH = 1  # January: UK Self Assessment deadline; US/CA filing season starts
SEEDS = [11, 22, 33, 44, 55]
HOLDOUT_SHARE = 0.10

CATS = ['coffee', 'fuel', 'wash', 'loo', 'gear', 'tyre', 'insurance', 'tax', 'gym', 'parking', 'phone', 'meal']
LABEL = {
    'coffee': 'Coffee, food and snacks', 'fuel': 'Fuel or EV charging', 'wash': 'Car wash',
    'loo': 'Toilets/rest stop (loo + coffee)', 'gear': 'Mounts, chargers, bike gear',
    'tyre': 'Tyres, servicing, MOT', 'insurance': 'Insurance and breakdown', 'tax': 'Accounting/tax help',
    'gym': 'Gym or physio', 'parking': 'Parking', 'phone': 'Phone plans', 'meal': 'Meal deals near hotspots',
}
INSTORE = ['coffee', 'fuel', 'wash', 'loo', 'gym', 'parking', 'meal']
ONLINE = ['gear', 'tyre', 'insurance', 'tax', 'phone']

# ---------------------------------------------------------------- population
COUNTRY_W = {'UK': .35, 'US': .30, 'AU': .18, 'CA': .17}
WORK_W = {'food_car': .20, 'food_moped': .09, 'food_ebike': .12, 'food_bicycle': .05,
          'parcels_van': .16, 'ridehail': .18, 'care': .10, 'trades': .10}
VEHICLE = {'food_car': 'car', 'food_moped': 'moped', 'food_ebike': 'ebike', 'food_bicycle': 'bicycle',
           'parcels_van': 'van', 'ridehail': 'car', 'care': 'car', 'trades': 'van'}
SHIFT_W = {
    'food': {'peaks': .60, 'nights': .15, 'mixed': .25},
    'parcels_van': {'early': .70, 'daytime': .30},
    'ridehail': {'nights': .30, 'peaks': .25, 'mixed': .45},
    'care': {'daytime': .60, 'early': .25, 'mixed': .15},
    'trades': {'daytime': .90, 'early': .10},
}
PART_TIME = {'food': .35, 'ridehail': .30, 'parcels_van': .20, 'care': .15, 'trades': .05}
SHIFT_LEN = {'food': 4, 'ridehail': 6, 'parcels_van': 8, 'care': 8, 'trades': 8}
URBAN = {'food': .90, 'ridehail': .85, 'parcels_van': .60, 'care': .60, 'trades': .55}
INCOME_W = {'low': .35, 'mid': .45, 'high': .20}
DIET_W = {'none': .72, 'vegetarian': .10, 'vegan': .04, 'halal': .09, 'other': .05}
COFFEE_W = {'none': .25, 'some': .45, 'heavy': .30}
ATTITUDE_W = {'enthusiast': .20, 'neutral': .45, 'sceptic': .20, 'never': .15}
PRO_SHARE = {'enthusiast': .18, 'neutral': .12, 'sceptic': .08, 'never': .06}
EV_SHARE = {'UK': .14, 'US': .08, 'CA': .12, 'AU': .07}

# ---------------------------------------------------------------- preferences
#                coffee fuel wash loo  gear tyre ins  tax  gym  park phone meal
BASE_U = {
    'food_car':     [.60, .70, .30, .55, .30, .40, .25, .40, .15, .30, .20, .50],
    'food_moped':   [.60, .50, .05, .65, .45, .35, .30, .35, .15, .15, .20, .55],
    'food_ebike':   [.55, .00, .00, .70, .70, .05, .15, .30, .20, .05, .20, .60],
    'food_bicycle': [.50, .00, .00, .65, .60, .00, .10, .25, .25, .00, .20, .60],
    'parcels_van':  [.65, .80, .20, .50, .25, .55, .30, .50, .10, .35, .20, .30],
    'ridehail':     [.50, .80, .70, .60, .35, .55, .35, .45, .15, .45, .25, .30],
    'care':         [.60, .55, .10, .40, .20, .35, .20, .30, .15, .65, .15, .25],
    'trades':       [.45, .55, .15, .25, .30, .55, .35, .70, .15, .45, .20, .20],
}
COUNTRY_MOD = {
    'UK': {'loo': 1.3, 'fuel': .8, 'wash': .9, 'tax': 1.1},
    'US': {'fuel': 1.3, 'loo': .85, 'wash': 1.1, 'coffee': .9, 'gym': 1.1},
    'CA': {'tyre': 1.4, 'fuel': 1.1, 'loo': .8},
    'AU': {'parking': 1.2, 'fuel': 1.1, 'coffee': 1.1, 'wash': 1.1},
}
SHIFT_MOD = {
    'nights': {'loo': 1.3, 'coffee': 1.1, 'meal': .8},
    'early': {'coffee': 1.2, 'meal': .7},
    'peaks': {'meal': 1.2},
    'daytime': {'parking': 1.1},
    'mixed': {},
}
INCOME_MOD = {'low': 1.15, 'mid': 1.0, 'high': .85}
COFFEE_MOD = {'none': .4, 'some': 1.0, 'heavy': 1.4}      # applies to coffee; loo+coffee gets the square root
DIET_MOD = {'none': 1.0, 'vegetarian': .7, 'vegan': .5, 'halal': .6, 'other': .8}  # meal deals rarely suit
NOISE_SIGMA = .35
ATT_CONV = {'enthusiast': 1.0, 'neutral': .65, 'sceptic': .20, 'never': .03}
ATT_OPEN = {'enthusiast': .75, 'neutral': .40, 'sceptic': .15, 'never': .05}
PRO_OPEN_BONUS = .08
NOVELTY_FLOOR, NOVELTY_TAU = .6, 4.0   # weekly open chance decays to 60% of start, time constant 4 weeks
K_INSTORE, K_ONLINE = .55, .60
P_CARD = .30            # chance a "parked near a partner" card is seen in a moment (cards on)
P_CARD_ONLINE = .50     # tax-time card / mileage-milestone card seen in a month of need

# ---------------------------------------------------------------- opportunity
#                coffee fuel wash loo  gym  park meal   (chance per shift of a moment)
MOMENT = {
    'food_car':     [.50, .30, .08, .40, .03, .25, .35],
    'food_moped':   [.50, .30, .00, .45, .03, .10, .35],
    'food_ebike':   [.50, .00, .00, .45, .03, .00, .35],
    'food_bicycle': [.45, .00, .00, .40, .03, .00, .35],
    'parcels_van':  [.35, .30, .06, .30, .02, .30, .15],
    'ridehail':     [.35, .35, .15, .35, .03, .25, .15],
    'care':         [.40, .25, .04, .20, .02, .60, .10],
    'trades':       [.30, .25, .05, .10, .02, .40, .10],
}
NIGHT_MOMENT = {'coffee': .5, 'meal': .5, 'gym': .3, 'wash': .3}
COVERAGE = {  # chance a partner covers the driver's area: (urban, rural)
    'coffee': (.85, .50), 'fuel': (.60, .40), 'wash': (.45, .25), 'loo': (.70, .35),
    'gym': (.40, .15), 'parking': (.30, .10), 'meal': (.70, .35),
}
EV_FUEL_COVERAGE = .7
ONLINE_NEED = {  # monthly chance of a need, by vehicle
    'gear': {'bicycle': .25, 'ebike': .25, 'moped': .12, 'car': .06, 'van': .06},
    'tyre': {'bicycle': 0, 'ebike': 0, 'moped': .08, 'car': .10, 'van': .10},
    'insurance': {'bicycle': .02, 'ebike': .02, 'moped': .03, 'car': .03, 'van': .03},
    'phone': {'bicycle': .03, 'ebike': .03, 'moped': .03, 'car': .03, 'van': .03},
}
TAX_SEASON = {'UK': {12, 1}, 'US': {2, 3, 4}, 'CA': {3, 4}, 'AU': {7, 8, 9, 10}}
TAX_FILE = {'food': .70, 'ridehail': .70, 'parcels_van': .70, 'care': .50, 'trades': .95}

# ---------------------------------------------------------------- mechanics
MOVING = {'car': .10, 'van': .10, 'moped': .15, 'ebike': .25, 'bicycle': .25}  # claims tried while "moving"
PTC_RETRY = .50          # blocked by park-to-claim, then claims once parked
BUSY = {'peaks': .80, 'nights': .45, 'early': .60, 'daytime': .50, 'mixed': .60}
EXPIRE_BASE = .25        # p(expire) = busy x 0.25 x (30 / window minutes)
RECLAIM = .30            # expired code: driver claims again later the same week
FVO_ENFORCE = .70        # new-customer-only: share of existing customers refused at the till
FVO_FIRST_BOOST, FVO_RETURN = 1.25, .70
LADDER_BOOST, LADDER_HABIT = 1.30, 1.25

# ---------------------------------------------------------------- partner side
PRIOR = {'coffee': .40, 'fuel': .45, 'wash': .20, 'loo': .20, 'gym': .08, 'parking': .35, 'meal': .30,
         'gear': .10, 'tyre': .20, 'insurance': .30, 'tax': .15, 'phone': .30}
VISIT_EXISTING = {'coffee': .45, 'fuel': .50, 'wash': .20, 'loo': .35, 'gym': .40, 'parking': .30, 'meal': .30}
HABIT = {'coffee': .12, 'fuel': .15, 'wash': .06, 'loo': .10, 'gym': .10, 'parking': .08, 'meal': .10}
NEW_BASE = .01
EXISTING_DESIRE = 1.5   # existing customers are likelier to claim their own café's offer
# Assumed income to MileSprout per redemption (GBP), from rewards-partners.md ranges and the partner panel.
PRICE = {'coffee': .40, 'fuel': .75, 'wash': 1.25, 'loo': .45, 'gear': 3.0, 'tyre': 6.0, 'insurance': 10.0,
         'tax': 30.0, 'gym': 2.0, 'parking': .50, 'phone': 10.0, 'meal': .40}

BASELINE = dict(window=30, cap=1, ladder=False, fvo=False, ptc=True, cards=True,
                open_mult=1.0, cov_mult=1.0, prior_mult=1.0)


def pick(rng, weights):
    r, acc = rng.random(), 0.0
    for k, w in weights.items():
        acc += w
        if r < acc:
            return k
    return k


def group(work):
    return 'food' if work.startswith('food') else work


def make_population(seed):
    rng = random.Random(seed)
    pop = []
    for i in range(N_DRIVERS):
        country = pick(rng, COUNTRY_W)
        work = pick(rng, WORK_W)
        g = group(work)
        vehicle = VEHICLE[work]
        shift = pick(rng, SHIFT_W[g])
        part = rng.random() < PART_TIME[g]
        hours = rng.uniform(6, 16) if part else rng.triangular(20, 60, 40)
        att = pick(rng, ATTITUDE_W)
        d = dict(id=i, country=country, work=work, group=g, vehicle=vehicle, shift=shift,
                 part_time=part, hours=hours, shifts=hours / SHIFT_LEN[g],
                 income=pick(rng, INCOME_W), urban=rng.random() < URBAN[g],
                 diet=pick(rng, DIET_W), coffee=pick(rng, COFFEE_W), att=att,
                 pro=rng.random() < PRO_SHARE[att],
                 ev=vehicle == 'car' and rng.random() < EV_SHARE[country],
                 holdout=rng.random() < HOLDOUT_SHARE,
                 cov_u={c: rng.random() for c in INSTORE},
                 prior_u={c: rng.random() for c in CATS})
        u = {}
        for j, c in enumerate(CATS):
            x = BASE_U[work][j]
            x *= COUNTRY_MOD[country].get(c, 1) * SHIFT_MOD[shift].get(c, 1)
            if c in ('coffee', 'meal', 'loo', 'gym', 'wash', 'fuel'):
                x *= INCOME_MOD[d['income']] if c != 'gym' else (1.2 if d['income'] == 'high' else 1.0)
            if c == 'coffee':
                x *= COFFEE_MOD[d['coffee']]
            if c == 'loo':
                x *= math.sqrt(COFFEE_MOD[d['coffee']])
            if c == 'meal':
                x *= DIET_MOD[d['diet']]
            x *= rng.lognormvariate(0, NOISE_SIGMA)
            u[c] = min(1.0, x)
        d['u'] = u
        pop.append(d)
    return pop


def run(pop, p, seed):
    rng = random.Random(seed * 7919 + 1)
    R = defaultdict(float)
    red_c = defaultdict(int)
    red_country = defaultdict(int)
    red_work = defaultdict(int)
    driver_month_any = 0
    driver_month_any_country = defaultdict(int)
    driver_month_any_att = defaultdict(int)
    n_t = n_h = 0
    n_t_country = defaultdict(int)
    n_t_work = defaultdict(int)
    n_t_att = defaultdict(int)
    vis_t = defaultdict(int)
    vis_h = defaultdict(int)
    cf_t = defaultdict(float)
    netnew = defaultdict(int)
    cannibal = defaultdict(int)
    rep_base = defaultdict(int)
    rep_hit = defaultdict(int)
    rep_org = defaultdict(int)

    for d in pop:
        treated = not d['holdout']
        if treated:
            n_t += 1
            n_t_country[d['country']] += 1
            n_t_work[d['work']] += 1
            n_t_att[d['att']] += 1
        else:
            n_h += 1
        st = {}
        for c in CATS:
            q = min(.9, PRIOR[c] * p['prior_mult'])
            relevant = BASE_U[d['work']][CATS.index(c)] > 0
            st[c] = dict(existing=relevant and d['prior_u'][c] < q, n=0, became=False,
                         first=None, netnew=False, vweeks=set(), oweeks=set(), done=False)
        cov = {}
        for c in INSTORE:
            pc = COVERAGE[c][0 if d['urban'] else 1]
            if c == 'fuel' and d['ev']:
                pc *= EV_FUEL_COVERAGE
            cov[c] = d['cov_u'][c] < min(.95, pc * p['cov_mult'])
        month_red = [0] * MONTHS
        month_open = [False] * MONTHS
        busy = BUSY[d['shift']] * (1.15 if d['hours'] > 45 else 1.0)
        p_exp = min(.8, busy * EXPIRE_BASE * 30.0 / p['window'])
        moving = MOVING[d['vehicle']]
        mi = MOMENT[d['work']]
        for w in range(WEEKS):
            m = min(MONTHS - 1, int(w / WPM))
            decay = NOVELTY_FLOOR + (1 - NOVELTY_FLOOR) * math.exp(-w / NOVELTY_TAU)
            p_open = (ATT_OPEN[d['att']] + (PRO_OPEN_BONUS if d['pro'] else 0)) * p['open_mult'] * decay
            opened = treated and rng.random() < min(.95, p_open)
            if opened:
                month_open[m] = True
            shifts = max(0, round(rng.gauss(d['shifts'], 1)))
            for k, c in enumerate(INSTORE):
                s = st[c]
                if BASE_U[d['work']][CATS.index(c)] == 0:
                    continue
                if s['existing']:
                    b = VISIT_EXISTING[c]
                elif s['became']:
                    b = HABIT[c] * (LADDER_HABIT if p['ladder'] and s['n'] >= 3 else 1)
                else:
                    b = NEW_BASE
                b0 = VISIT_EXISTING[c] if s['existing'] else NEW_BASE
                base_visit = 1 if rng.random() < b else 0
                red = 0
                if treated and cov[c] and shifts:
                    pm = mi[k] * (NIGHT_MOMENT.get(c, 1) if d['shift'] == 'nights' else 1)
                    for _ in range(shifts):
                        if red >= p['cap']:
                            break
                        if rng.random() >= pm:
                            continue
                        if not (opened or (p['cards'] and rng.random() < P_CARD)):
                            continue
                        desire = d['u'][c] * ATT_CONV[d['att']] * K_INSTORE
                        if s['existing']:
                            desire *= EXISTING_DESIRE
                        if p['fvo']:
                            if s['n'] == 0:
                                if s['existing'] and rng.random() < FVO_ENFORCE:
                                    R['fvo_refused'] += 1
                                    continue
                                desire *= FVO_FIRST_BOOST
                            else:
                                desire *= FVO_RETURN
                        if p['ladder'] and 1 <= s['n'] <= 2:
                            desire *= LADDER_BOOST
                        if rng.random() >= min(.95, desire):
                            continue
                        R['attempts'] += 1
                        if p['ptc'] and rng.random() < moving:
                            R['blocked'] += 1
                            if rng.random() >= PTC_RETRY:
                                R['lost_ptc'] += 1
                                continue
                        if rng.random() < p_exp:
                            R['expired'] += 1
                            if rng.random() >= RECLAIM:
                                R['lost_expiry'] += 1
                                continue
                        red += 1
                        if s['n'] == 0:
                            s['first'] = w
                            s['netnew'] = not s['existing']
                            if s['netnew']:
                                s['became'] = True
                        if not s['existing']:
                            netnew[c] += 1
                        s['n'] += 1
                visits = max(red, base_visit)
                if treated:
                    vis_t[c] += visits
                    cf_t[c] += b0
                    cannibal[c] += min(red, base_visit)
                    if red:
                        red_c[c] += red
                        red_country[(d['country'], c)] += red
                        red_work[(d['work'], c)] += red
                        month_red[m] += red
                    if visits and s['netnew'] and s['first'] is not None and w > s['first']:
                        s['vweeks'].add(w)
                        if not red:
                            s['oweeks'].add(w)
                else:
                    vis_h[c] += visits
        if not treated:
            continue
        # online categories, monthly
        for m in range(MONTHS):
            month = (START_MONTH - 1 + m) % 12 + 1
            for c in ONLINE:
                s = st[c]
                if c == 'tax':
                    if s['done'] or month not in TAX_SEASON[d['country']]:
                        continue
                    need = TAX_FILE[d['group']] * (.7 if d['part_time'] else 1) / len(TAX_SEASON[d['country']])
                    card = True
                else:
                    need = ONLINE_NEED[c][d['vehicle']]
                    if c == 'tyre':
                        need *= d['hours'] / 30
                    card = c == 'tyre'
                if rng.random() >= need:
                    continue
                seen = month_open[m] or (p['cards'] and card and rng.random() < P_CARD_ONLINE)
                if not seen:
                    continue
                if rng.random() < min(.95, d['u'][c] * ATT_CONV[d['att']] * K_ONLINE):
                    red_c[c] += 1
                    red_country[(d['country'], c)] += 1
                    red_work[(d['work'], c)] += 1
                    month_red[m] += 1
                    if not s['existing']:
                        netnew[c] += 1
                    s['n'] += 1
                    if c == 'tax':
                        s['done'] = True
        any_m = sum(1 for x in month_red if x)
        driver_month_any += any_m
        driver_month_any_country[d['country']] += any_m
        driver_month_any_att[d['att']] += any_m
        # 30-day repeat for net-new in-store customers (first redemption with 4 weeks to observe)
        for c in INSTORE:
            s = st[c]
            if s['netnew'] and s['first'] is not None and s['first'] <= WEEKS - 5:
                rep_base[c] += 1
                if any(s['first'] < x <= s['first'] + 4 for x in s['vweeks']):
                    rep_hit[c] += 1
                if any(s['first'] < x <= s['first'] + 4 for x in s['oweeks']):
                    rep_org[c] += 1

    per = lambda x, n: 100.0 * x / n / MONTHS if n else 0.0
    res = {'n_t': n_t, 'n_h': n_h}
    for c in CATS:
        res[('red', c)] = per(red_c[c], n_t)
        res[('netnew', c)] = 100.0 * netnew[c] / red_c[c] if red_c[c] else float('nan')
    for c in INSTORE:
        res[('cannibal', c)] = 100.0 * cannibal[c] / red_c[c] if red_c[c] else float('nan')
        res[('repeat', c)] = 100.0 * rep_hit[c] / rep_base[c] if rep_base[c] else float('nan')
        res[('repeat_org', c)] = 100.0 * rep_org[c] / rep_base[c] if rep_base[c] else float('nan')
        res[('inc_holdout', c)] = 100.0 * (vis_t[c] / n_t - vis_h[c] / n_h) / MONTHS if n_h else float('nan')
        res[('inc_true', c)] = per(vis_t[c] - cf_t[c], n_t)
    res['total'] = per(sum(red_c.values()), n_t)
    res['revenue'] = sum(per(red_c[c], n_t) * PRICE[c] for c in CATS)
    for c in CATS:
        res[('rev', c)] = per(red_c[c], n_t) * PRICE[c]
    res['instore_total'] = sum(res[('red', c)] for c in INSTORE)
    res['any_month'] = 100.0 * driver_month_any / n_t / MONTHS
    for k, v in n_t_country.items():
        res[('any_country', k)] = 100.0 * driver_month_any_country[k] / v / MONTHS
        for c in CATS:
            res[('red_country', k, c)] = per(red_country[(k, c)], v)
    for k, v in n_t_work.items():
        for c in CATS:
            res[('red_work', k, c)] = per(red_work[(k, c)], v)
    for k, v in n_t_att.items():
        res[('any_att', k)] = 100.0 * driver_month_any_att[k] / v / MONTHS
    att = R['attempts'] or 1
    res['blocked_pct'] = 100.0 * R['blocked'] / att
    res['lost_ptc_pct'] = 100.0 * R['lost_ptc'] / att
    res['expired_pct'] = 100.0 * R['expired'] / att
    res['lost_expiry_pct'] = 100.0 * R['lost_expiry'] / att
    inst = sum(red_c[c] for c in INSTORE) or 1
    res['instore_netnew'] = 100.0 * sum(netnew[c] for c in INSTORE) / inst
    res['instore_cannibal'] = 100.0 * sum(cannibal[c] for c in INSTORE) / inst
    rb = sum(rep_base.values())
    res['instore_repeat'] = 100.0 * sum(rep_hit.values()) / rb if rb else float('nan')
    res['instore_inc_true'] = sum(res[('inc_true', c)] for c in INSTORE)
    res['instore_inc_holdout'] = sum(res[('inc_holdout', c)] for c in INSTORE)
    res['instore_inc_per100red'] = 100.0 * res['instore_inc_true'] / res['instore_total'] if res['instore_total'] else float('nan')
    return res


def runs(params, pops):
    return [run(pop, params, s) for s, pop in zip(SEEDS, pops)]


def stats(rs, key):
    xs = [r[key] for r in rs if key in r and not math.isnan(r[key])]
    if not xs:
        return (float('nan'),) * 3
    return statistics.mean(xs), min(xs), max(xs)


def f1(x):
    return '' if math.isnan(x) else f'{x:.1f}'


def write(name, header, rows):
    with open(os.path.join(OUT, name), 'w', newline='') as fh:
        w = csv.writer(fh)
        w.writerow(header)
        w.writerows(rows)


def main():
    pops = [make_population(s) for s in SEEDS]
    base = runs(BASELINE, pops)

    # 1. categories overall, ranked
    rows = []
    for c in CATS:
        mean, lo, hi = stats(base, ('red', c))
        rmean, rlo, rhi = stats(base, ('rev', c))
        rows.append([LABEL[c], 'in-store' if c in INSTORE else 'online', f1(mean), f1(lo), f1(hi),
                     f'{PRICE[c]:.2f}', f1(rmean), f'{f1(rlo)}-{f1(rhi)}'])
    rows.sort(key=lambda r: -float(r[2]))
    write('categories_overall.csv', ['category', 'kind', 'per100_month_mean', 'min_seed', 'max_seed',
                                     'assumed_gbp_per_redemption', 'gbp_per100_month_mean', 'gbp_range'], rows)

    # 2. by country and by work type
    countries = ['UK', 'US', 'CA', 'AU']
    works = list(WORK_W)
    rows = []
    for c in CATS:
        row = [LABEL[c]]
        for k in countries:
            mean, lo, hi = stats(base, ('red_country', k, c))
            row += [f1(mean), f'{f1(lo)}-{f1(hi)}']
        rows.append(row)
    write('categories_by_country.csv',
          ['category'] + [x for k in countries for x in (f'{k}_mean', f'{k}_range')], rows)
    rows = []
    for c in CATS:
        rows.append([LABEL[c]] + [f1(stats(base, ('red_work', k, c))[0]) for k in works])
    write('categories_by_worktype.csv', ['category'] + works, rows)

    # 3. reach
    rows = [['all', *map(f1, stats(base, 'any_month'))]]
    rows += [[k, *map(f1, stats(base, ('any_country', k)))] for k in countries]
    rows += [[k, *map(f1, stats(base, ('any_att', k)))] for k in ATTITUDE_W]
    write('reach.csv', ['group', 'pct_redeem_at_least_once_a_month_mean', 'min_seed', 'max_seed'], rows)

    # 4. partner side per category, under four offer designs
    designs = {'plain': BASELINE,
               'ladder': dict(BASELINE, ladder=True),
               'first_visit_only': dict(BASELINE, fvo=True),
               'ladder+first_visit_only': dict(BASELINE, ladder=True, fvo=True)}
    dres = {k: (base if k == 'plain' else runs(v, pops)) for k, v in designs.items()}
    rows = []
    for c in CATS:
        row = [LABEL[c], f1(stats(base, ('netnew', c))[0])]
        if c in INSTORE:
            row += [f1(stats(base, ('cannibal', c))[0]),
                    f1(stats(base, ('repeat', c))[0]),
                    f1(stats(base, ('repeat_org', c))[0]),
                    f1(stats(dres['ladder'], ('repeat', c))[0]),
                    f1(stats(dres['ladder'], ('repeat_org', c))[0]),
                    f1(stats(dres['first_visit_only'], ('netnew', c))[0]),
                    f1(stats(dres['first_visit_only'], ('repeat', c))[0]),
                    f1(stats(base, ('inc_true', c))[0]),
                    '%s (%s to %s)' % tuple(map(f1, stats(base, ('inc_holdout', c)))),
                    f1(100 * stats(base, ('inc_true', c))[0] / stats(base, ('red', c))[0])]
        else:
            row += [''] * 10
        rows.append(row)
    write('partner_side.csv',
          ['category', 'netnew_pct', 'cannibalised_pct', 'repeat30_pct_plain', 'repeat30_without_code_pct_plain',
           'repeat30_pct_ladder', 'repeat30_without_code_pct_ladder',
           'netnew_pct_first_visit_only', 'repeat30_pct_first_visit_only',
           'incremental_visits_per100_month_true', 'incremental_per100_holdout_estimate_mean_(seed_range)',
           'incremental_visits_per_100_redemptions'], rows)

    # 5. mechanics
    variants = {
        'baseline (30 min, cap 1/wk, park to claim, cards on)': BASELINE,
        'window 60 min': dict(BASELINE, window=60),
        'window 15 min': dict(BASELINE, window=15),
        'cap 2/week': dict(BASELINE, cap=2),
        'loyalty ladder on': dict(BASELINE, ladder=True),
        'first-visit-only offer on': dict(BASELINE, fvo=True),
        'ladder + first-visit-only': dict(BASELINE, ladder=True, fvo=True),
        'park to claim off': dict(BASELINE, ptc=False),
        'contextual cards off (tab only)': dict(BASELINE, cards=False),
    }
    known = {'loyalty ladder on': dres['ladder'], 'first-visit-only offer on': dres['first_visit_only'],
             'ladder + first-visit-only': dres['ladder+first_visit_only']}
    rows = []
    for name, v in variants.items():
        rs = base if v is BASELINE else known.get(name) or runs(v, pops)
        rows.append([name] + [f1(stats(rs, k)[0]) for k in
                              ('total', 'instore_total', 'any_month', 'instore_netnew', 'instore_cannibal',
                               'instore_repeat', 'instore_inc_true', 'instore_inc_per100red', 'revenue',
                               'expired_pct', 'blocked_pct', 'lost_ptc_pct')]
                    + ['%s-%s' % (f1(stats(rs, 'total')[1]), f1(stats(rs, 'total')[2]))])
    write('mechanics.csv',
          ['variant', 'all_redemptions_per100_month', 'instore_per100_month', 'pct_drivers_redeem_monthly',
           'instore_netnew_pct', 'instore_cannibalised_pct', 'instore_repeat30_pct',
           'instore_incremental_visits_per100_month', 'incremental_visits_per_100_instore_redemptions',
           'gbp_per100_month', 'pct_attempts_expired', 'pct_attempts_blocked_park_to_claim',
           'pct_attempts_lost_to_park_to_claim', 'all_redemptions_seed_range'], rows)

    # 6. sensitivity on the three most uncertain assumptions
    rows = []
    for key, label in (('open_mult', 'weekly Perks-tab open rate'),
                       ('cov_mult', 'partner coverage near drivers'),
                       ('prior_mult', 'share already a customer of the partner')):
        for lvl in (.5, 1.0, 1.5):
            rs = base if lvl == 1.0 else runs(dict(BASELINE, **{key: lvl}), pops)
            rows.append([label, f'x{lvl}'] + [f1(stats(rs, k)[0]) for k in
                                                ('total', 'any_month', 'instore_netnew', 'instore_cannibal',
                                                 'instore_inc_true', 'revenue')]
                        + [LABEL[max(CATS, key=lambda c: stats(rs, ('red', c))[0])]])
    write('sensitivity.csv',
          ['assumption', 'level', 'all_redemptions_per100_month', 'pct_drivers_redeem_monthly',
           'instore_netnew_pct', 'instore_cannibalised_pct', 'instore_incremental_visits_per100_month',
           'gbp_per100_month', 'top_category'], rows)

    # population check
    pop = pops[0]
    rows = []
    for attr in ('country', 'work', 'shift', 'income', 'diet', 'coffee', 'att'):
        counts = defaultdict(int)
        for d in pop:
            counts[d[attr]] += 1
        rows += [[attr, k, v] for k, v in sorted(counts.items())]
    rows += [['urban', 'yes', sum(d['urban'] for d in pop)], ['part_time', 'yes', sum(d['part_time'] for d in pop)],
             ['pro', 'yes', sum(d['pro'] for d in pop)], ['ev', 'yes', sum(d['ev'] for d in pop)],
             ['holdout', 'yes', sum(d['holdout'] for d in pop)]]
    write('population_seed1.csv', ['attribute', 'value', 'drivers'], rows)
    print('done; CSVs in', OUT)


if __name__ == '__main__':
    main()
