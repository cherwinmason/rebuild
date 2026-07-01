import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';
import {
  Dumbbell, Apple, Target, TrendingDown, Calendar, Flame, Activity, Plus, Trash2, Check, X,
  Camera, Ruler, Bell, MessageCircle, Settings, Award, Edit2, ChevronRight, ChevronLeft,
  Moon, Footprints, Star, Save, Download, Upload, RotateCcw, Image as ImageIcon, Send,
  Clock, Pencil, Trophy, Zap, Heart, ArrowUp, ArrowDown
} from 'lucide-react';

// =====================================================
// REBUILD v5 — The Complete App
// Tier 1-3 features. The whole system.
// =====================================================

const DEFAULT_TARGET = 68;
const DEFAULT_START_WEIGHT = 78;

// Default sessions - users can customize via settings
const DEFAULT_SESSIONS = {
  A: {
    name: 'PUSH + CORE',
    focus: 'Chest, shoulders, triceps, abs',
    duration: '45 min',
    exercises: [
      { name: 'Pull-up bar negatives or chin-ups', sets: 3, reps: '5', notes: 'Jump up, lower for 5 seconds. Builds pull-up strength.' },
      { name: 'Push-ups', sets: 4, reps: 'AMRAP-2', notes: 'Hardest variation you can do clean. Stop 2 reps short of failure.' },
      { name: 'Dip bar dips (or bench dips)', sets: 3, reps: 'AMRAP-2', notes: 'Full ROM. Bench dips if parallel bars too hard.' },
      { name: 'DB Shoulder Press', sets: 3, reps: '10', notes: 'Strict. Add weight when 10 reps clean.' },
      { name: 'Cable Tricep Pushdowns', sets: 3, reps: '12', notes: 'Slow eccentric. Squeeze at bottom.' },
      { name: 'Hanging Knee Raises', sets: 3, reps: '12', notes: 'Controlled. Knees to chest.' },
      { name: 'Plank', sets: 3, reps: '45s', notes: 'No sag. Tight everything.' },
    ],
  },
  B: {
    name: 'PULL + LEGS',
    focus: 'Back, biceps, quads, hamstrings',
    duration: '45 min',
    exercises: [
      { name: 'Pull-ups (band-assisted if needed)', sets: 4, reps: 'AMRAP-2', notes: 'Hero lift. Full hang to chin over bar.' },
      { name: 'Cable Rows', sets: 4, reps: '10', notes: 'Squeeze shoulder blades. Pause at chest.' },
      { name: 'Kettlebell Goblet Squats', sets: 4, reps: '12', notes: 'Below parallel. Elbows inside knees at bottom.' },
      { name: 'Kettlebell Swings', sets: 4, reps: '15', notes: 'Hip hinge, not a squat. Drive from hips.' },
      { name: 'DB Romanian Deadlifts', sets: 3, reps: '10', notes: 'Soft knees. Hinge at hips. Feel hamstrings stretch.' },
      { name: 'DB Bicep Curls', sets: 3, reps: '10', notes: 'No swinging. Squeeze.' },
      { name: 'Cable Face Pulls', sets: 3, reps: '15', notes: 'High elbows. Rear delt focus.' },
    ],
  },
  C: {
    name: 'CONDITIONING',
    focus: 'Cardio + full body circuit',
    duration: '45 min',
    exercises: [
      { name: 'Treadmill warm-up walk', sets: 1, reps: '5 min', notes: 'Easy pace. Get the body moving.' },
      { name: 'Intervals: 1 min run / 1 min walk', sets: 10, reps: '20 min total', notes: 'Run as fast as you can hold form.' },
      { name: 'Circuit: Push-ups', sets: 3, reps: '10', notes: 'No rest between exercises. Rest 60s between rounds.' },
      { name: 'Circuit: Kettlebell Swings', sets: 3, reps: '10', notes: 'Same circuit.' },
      { name: 'Circuit: Bodyweight Squats', sets: 3, reps: '10', notes: 'Same circuit.' },
      { name: 'Circuit: Plank', sets: 3, reps: '30s', notes: 'Same circuit.' },
      { name: 'Cool-down walk', sets: 1, reps: '10 min', notes: 'Easy pace. Let HR come down.' },
    ],
  },
  D: {
    name: 'RECOVERY ACTIVE',
    focus: 'Swim or walk + light calisthenics',
    duration: '45 min',
    exercises: [
      { name: 'Swim (or 45-min walk)', sets: 1, reps: '20-30 min', notes: 'Any strokes. Easy pace. Or brisk walk outside.' },
      { name: 'Push-ups', sets: 2, reps: '10', notes: 'After cardio. Easy circuit.' },
      { name: 'Walking Lunges', sets: 2, reps: '10/leg', notes: 'Long stride. Bodyweight only.' },
      { name: 'Hanging Knee Raises', sets: 2, reps: '10', notes: 'Controlled.' },
      { name: 'Plank', sets: 2, reps: '30s', notes: 'Tight core.' },
    ],
  },
};

const ACHIEVEMENTS = [
  { id: 'first_workout', name: 'First Step', icon: '🎯', condition: (data) => data.workouts.length >= 1, detail: 'Log your first workout' },
  { id: 'week_streak_1', name: 'Week One', icon: '🔥', condition: (data) => data.weekStreak >= 1, detail: 'Hit 4 workouts in a week' },
  { id: 'week_streak_4', name: 'One Month', icon: '⚡', condition: (data) => data.weekStreak >= 4, detail: '4 weeks straight of 4 workouts' },
  { id: 'week_streak_12', name: 'Quarter', icon: '💪', condition: (data) => data.weekStreak >= 12, detail: '12 weeks of consistency' },
  { id: 'workouts_25', name: '25 Sessions', icon: '🥉', condition: (data) => data.workouts.length >= 25, detail: '25 workouts logged' },
  { id: 'workouts_50', name: '50 Sessions', icon: '🥈', condition: (data) => data.workouts.length >= 50, detail: '50 workouts logged' },
  { id: 'workouts_100', name: 'Centurion', icon: '🥇', condition: (data) => data.workouts.length >= 100, detail: '100 workouts logged' },
  { id: 'weight_2kg', name: 'First 2kg', icon: '📉', condition: (data) => data.weightLost >= 2, detail: 'Lost your first 2kg' },
  { id: 'weight_5kg', name: 'Halfway', icon: '🎖️', condition: (data) => data.weightLost >= 5, detail: 'Lost 5kg total' },
  { id: 'weight_10kg', name: 'Goal Hit', icon: '🏆', condition: (data) => data.weightLost >= 10, detail: 'Lost 10kg — main goal' },
  { id: 'first_photo', name: 'On Camera', icon: '📸', condition: (data) => data.photos.length >= 1, detail: 'First progress photo' },
  { id: 'photos_10', name: 'Time-lapse', icon: '🎞️', condition: (data) => data.photos.length >= 10, detail: '10 weekly photos saved' },
  { id: 'first_measurement', name: 'Tape It Up', icon: '📏', condition: (data) => data.measurements.length >= 1, detail: 'First body measurement' },
  { id: 'high_mood', name: 'Vibes High', icon: '✨', condition: (data) => data.workouts.filter(w => w.mood >= 4).length >= 10, detail: '10 workouts rated 4-5 stars' },
];

const FOOD_RULES = [
  { rule: 'Breakfast: keep the smoothie', detail: 'Greens + protein. You already nailed this.' },
  { rule: 'Lunch: palm + fist + 2 fists', detail: 'Palm protein. Half rice. 2 fists veg. No fried.' },
  { rule: 'Dinner: same template', detail: 'Palm protein. Fist carbs. 2 fists veg.' },
  { rule: 'Snacks: protein-led', detail: 'Greek yogurt, eggs, protein shake, nuts.' },
  { rule: 'No drinking calories', detail: 'Black coffee, water, tea, zero-cal drinks.' },
  { rule: 'Try to stop eating by 9pm', detail: 'Not a hard rule. Just a goal.' },
  { rule: 'Alcohol: 2 drinks max per occasion', detail: 'Social only.' },
];

const HAWKER_GOOD = [
  'Yong Tau Foo — clear soup, tofu/fish/veg, no fried',
  'Chicken Rice — steamed, skin off, half rice, extra cucumber',
  'Sliced Fish Soup with rice (no fried fish)',
  'Salmon Don — brown rice, light sauce',
  'Cai Png — 1 protein + 2 green veg + half rice',
  'Korean grilled chicken bowl + kimchi',
  'Vietnamese Pho ga (chicken)',
  'Poke bowl — half rice, all veg',
  'Subway 6-inch chicken on wholewheat, no cheese',
];

const HAWKER_BAD = [
  'Char kway teow, hokkien mee, laksa',
  'Fried chicken, fried fish, anything fried',
  'Bubble tea, juice, sugary coffee',
  'Roti prata + curry',
  'Coconut rice (nasi lemak)',
];

// ---------- UTILS ----------
const todayStr = () => new Date().toISOString().slice(0, 10);

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ---------- SHARED COMPONENTS ----------
function Card({ children, className = '', onClick }) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-sm ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

function SectionHeader({ num, children, action }) {
  return (
    <div className="flex items-baseline gap-3 mb-4 mt-2">
      {num && <span className="text-xs font-mono text-orange-500">{num}</span>}
      <h2 className="text-xs tracking-[0.25em] uppercase text-zinc-300 font-bold flex-1">{children}</h2>
      {action}
    </div>
  );
}

function Button({ children, onClick, variant = 'primary', className = '', disabled }) {
  const styles = {
    primary: 'bg-orange-500 text-black hover:bg-orange-400 font-bold',
    secondary: 'bg-zinc-900 border border-zinc-800 text-white hover:border-orange-500/50',
    danger: 'bg-red-950/20 border border-red-900/50 text-red-400 hover:bg-red-950/40',
    ghost: 'text-zinc-500 hover:text-white',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-3 text-sm tracking-wider transition-all disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function StarRating({ value, onChange, size = 16 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)} className="transition-all">
          <Star size={size} className={n <= value ? 'fill-orange-500 text-orange-500' : 'text-zinc-700'} />
        </button>
      ))}
    </div>
  );
}

// ---------- ONBOARDING ----------
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('68');

  const steps = [
    {
      title: 'WELCOME',
      content: (
        <div className="space-y-6 text-center">
          <div className="text-7xl mb-4">💪</div>
          <h2 className="text-3xl font-bold text-white">Rebuild</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            One rule: 4 workouts a week. Everything else flexes.
            <br /><br />
            This isn't another fitness app trying to optimise your life. It's a tool. You bring the work.
          </p>
        </div>
      ),
    },
    {
      title: 'YOUR NAME',
      content: (
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm">What should the app call you?</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-xl text-white outline-none focus:border-orange-500"
            autoFocus
          />
        </div>
      ),
      validate: () => name.trim().length > 0,
    },
    {
      title: 'STARTING WEIGHT',
      content: (
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm">Where are you right now? (kg)</p>
          <input
            type="number"
            step="0.1"
            value={startWeight}
            onChange={(e) => setStartWeight(e.target.value)}
            placeholder="78.0"
            className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-3xl font-bold text-white outline-none focus:border-orange-500"
          />
          <p className="text-zinc-600 text-xs">Be honest. The app uses this as your baseline.</p>
        </div>
      ),
      validate: () => parseFloat(startWeight) > 30 && parseFloat(startWeight) < 200,
    },
    {
      title: 'TARGET WEIGHT',
      content: (
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm">Where do you want to be? (kg)</p>
          <input
            type="number"
            step="0.1"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-3xl font-bold text-white outline-none focus:border-orange-500"
          />
          <p className="text-zinc-600 text-xs">No deadline. We focus on hitting the number, not a date.</p>
        </div>
      ),
      validate: () => parseFloat(targetWeight) > 30 && parseFloat(targetWeight) < 200,
    },
    {
      title: 'THE ANCHOR',
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">⚓</div>
            <h3 className="text-2xl font-bold text-white">4 workouts a week.</h3>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            That's your one non-negotiable. Whenever you can fit them. Whatever order. Just 4 per week.
            <br /><br />
            Everything else — food, sleep, steps — is suggestion. Trend in the right direction.
            <br /><br />
            You can't fail at this plan unless you skip workouts. Hit 4, you win the week.
          </p>
        </div>
      ),
    },
    {
      title: 'READY',
      content: (
        <div className="space-y-6 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold text-white">Let's go, {name || 'champ'}.</h3>
          <div className="bg-zinc-900 border border-orange-500/30 p-5 text-left space-y-3">
            <div className="text-xs font-mono text-orange-500 tracking-wider mb-2">YOUR SETUP</div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Starting weight</span>
              <span className="text-white font-bold">{startWeight} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Target weight</span>
              <span className="text-orange-500 font-bold">{targetWeight} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">To lose</span>
              <span className="text-white font-bold">{(parseFloat(startWeight) - parseFloat(targetWeight)).toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Anchor</span>
              <span className="text-orange-500 font-bold">4 workouts / week</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step];
  const canProgress = !current.validate || current.validate();
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="px-6 pt-12 pb-4">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-0.5 ${i <= step ? 'bg-orange-500' : 'bg-zinc-800'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-8 flex items-center">
        <div className="w-full max-w-md mx-auto">
          <div className="text-[10px] font-mono tracking-[0.3em] text-orange-500 mb-6">{current.title}</div>
          {current.content}
        </div>
      </div>

      <div className="px-6 pb-8 flex gap-2 max-w-md mx-auto w-full">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">
            BACK
          </Button>
        )}
        <Button
          variant="primary"
          onClick={() => {
            if (isLast) {
              onComplete({ name: name.trim(), startWeight: parseFloat(startWeight), targetWeight: parseFloat(targetWeight) });
            } else if (canProgress) {
              setStep(step + 1);
            }
          }}
          disabled={!canProgress}
          className="flex-1 tracking-[0.2em]"
        >
          {isLast ? 'START' : 'CONTINUE'}
        </Button>
      </div>
    </div>
  );
}

// ---------- HOME TAB ----------
function HomeTab({ data, setData, navigateTo }) {
  const { weights, workouts, photos, measurements, profile } = data;
  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : profile.startWeight;
  const startWeight = weights.length > 0 ? weights[0].weight : profile.startWeight;
  const weightLost = (startWeight - currentWeight).toFixed(1);
  const toGo = (currentWeight - profile.targetWeight).toFixed(1);

  // This week's workouts
  const thisWeekWorkouts = useMemo(() => {
    const monday = getMondayOfWeek(new Date());
    return workouts.filter(w => new Date(w.date) >= monday).length;
  }, [workouts]);

  // Streak
  const weekStreak = useMemo(() => {
    if (workouts.length === 0) return 0;
    const weekCounts = {};
    workouts.forEach(w => {
      const key = getMondayOfWeek(w.date).toISOString().slice(0, 10);
      weekCounts[key] = (weekCounts[key] || 0) + 1;
    });
    const weeks = Object.entries(weekCounts).sort((a, b) => b[0].localeCompare(a[0]));
    let count = 0;
    let currentMonday = getMondayOfWeek(new Date()).toISOString().slice(0, 10);
    for (const [date, c] of weeks) {
      if (date === currentMonday && c < 4) continue;
      if (c >= 4) count++;
      else break;
    }
    return count;
  }, [workouts]);

  // Achievements earned
  const earnedAchievements = useMemo(() => {
    const ctx = { workouts, weightLost: parseFloat(weightLost), weekStreak, photos, measurements };
    return ACHIEVEMENTS.filter(a => a.condition(ctx));
  }, [workouts, weightLost, weekStreak, photos, measurements]);

  // Is it Sunday? (Show weekly review prompt)
  const isSunday = new Date().getDay() === 0;
  const hasLoggedThisWeek = weights.some(w => {
    const wDate = new Date(w.date);
    const monday = getMondayOfWeek(new Date());
    return wDate >= monday;
  });

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <div className="text-[10px] tracking-[0.25em] text-orange-500 uppercase font-mono mb-1">
          {new Date().toLocaleDateString('en-SG', { weekday: 'long' })}
        </div>
        <h1 className="text-3xl font-bold text-white">Hey {profile.name || 'champ'}.</h1>
        <p className="text-zinc-500 text-sm mt-1">One rule: 4 workouts. Everything else flexes.</p>
      </div>

      {/* Sunday prompt */}
      {isSunday && !hasLoggedThisWeek && (
        <Card className="p-4 border-orange-500/40 bg-gradient-to-br from-orange-500/10 to-transparent">
          <div className="flex items-start gap-3">
            <Bell size={20} className="text-orange-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-bold text-white mb-1">It's Sunday — weekly check-in</div>
              <div className="text-xs text-zinc-400 mb-3">Time to weigh in and take a progress photo.</div>
              <div className="flex gap-2">
                <Button variant="primary" onClick={() => navigateTo('progress')} className="text-xs py-2 px-3">WEIGH IN</Button>
                <Button variant="secondary" onClick={() => navigateTo('photos')} className="text-xs py-2 px-3">TAKE PHOTO</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* This week's anchor */}
      <Card className="p-5 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent">
        <div className="flex justify-between items-start mb-3">
          <div className="text-[10px] font-mono tracking-wider text-orange-500">THIS WEEK</div>
          {weekStreak > 0 && (
            <div className="flex items-center gap-1 text-orange-500">
              <Flame size={14} />
              <span className="text-xs font-mono">{weekStreak}</span>
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <div className="text-6xl font-bold text-white">{thisWeekWorkouts}</div>
          <div className="text-2xl font-mono text-zinc-600">/ 4</div>
          <div className="ml-auto text-xs font-mono text-zinc-500">workouts</div>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-sm overflow-hidden">
          <div className={`h-full transition-all ${thisWeekWorkouts >= 4 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(100, (thisWeekWorkouts / 4) * 100)}%` }} />
        </div>
        <div className="text-[10px] font-mono text-zinc-500 mt-3">
          {thisWeekWorkouts >= 4 ? '✓ Week locked. Anchor held.' : `${4 - thisWeekWorkouts} more to win the week.`}
        </div>
      </Card>

      {/* Weight stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3">
          <div className="text-[9px] font-mono tracking-wider text-zinc-500 mb-1">CURRENT</div>
          <div className="text-xl font-bold text-white">{currentWeight}<span className="text-zinc-600 text-xs"> kg</span></div>
        </Card>
        <Card className="p-3">
          <div className="text-[9px] font-mono tracking-wider text-green-500 mb-1">LOST</div>
          <div className="text-xl font-bold text-green-400">{parseFloat(weightLost) > 0 ? '-' : ''}{Math.abs(weightLost)}<span className="text-zinc-600 text-xs"> kg</span></div>
        </Card>
        <Card className="p-3">
          <div className="text-[9px] font-mono tracking-wider text-orange-500 mb-1">TO GO</div>
          <div className="text-xl font-bold text-orange-400">{toGo}<span className="text-zinc-600 text-xs"> kg</span></div>
        </Card>
      </div>

      {/* Recent achievements */}
      {earnedAchievements.length > 0 && (
        <div>
          <SectionHeader>Recent Wins</SectionHeader>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {earnedAchievements.slice(-4).reverse().map(a => (
              <div key={a.id} className="flex-shrink-0 w-24 bg-zinc-900 border border-orange-500/30 p-3 text-center">
                <div className="text-3xl mb-1">{a.icon}</div>
                <div className="text-[10px] font-mono text-orange-500 leading-tight">{a.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <SectionHeader>Quick Actions</SectionHeader>
        <div className="grid grid-cols-2 gap-2">
          <Card className="p-4 cursor-pointer hover:border-orange-500/50" onClick={() => navigateTo('workouts')}>
            <Dumbbell size={20} className="text-orange-500 mb-2" />
            <div className="text-sm font-bold text-white">Train</div>
            <div className="text-[10px] font-mono text-zinc-500">Log workout</div>
          </Card>
          <Card className="p-4 cursor-pointer hover:border-orange-500/50" onClick={() => navigateTo('progress')}>
            <TrendingDown size={20} className="text-orange-500 mb-2" />
            <div className="text-sm font-bold text-white">Progress</div>
            <div className="text-[10px] font-mono text-zinc-500">Weight + body</div>
          </Card>
          <Card className="p-4 cursor-pointer hover:border-orange-500/50" onClick={() => navigateTo('photos')}>
            <Camera size={20} className="text-orange-500 mb-2" />
            <div className="text-sm font-bold text-white">Photos</div>
            <div className="text-[10px] font-mono text-zinc-500">{photos.length} saved</div>
          </Card>
          <Card className="p-4 cursor-pointer hover:border-orange-500/50" onClick={() => navigateTo('food')}>
            <Apple size={20} className="text-orange-500 mb-2" />
            <div className="text-sm font-bold text-white">Food</div>
            <div className="text-[10px] font-mono text-zinc-500">Rules + hawker</div>
          </Card>
        </div>
      </div>

      {/* Daily quick log */}
      <div>
        <SectionHeader>Today's Inputs</SectionHeader>
        <DailyLogCard data={data} setData={setData} />
      </div>
    </div>
  );
}

// ---------- DAILY LOG CARD ----------
function DailyLogCard({ data, setData }) {
  const today = todayStr();
  const log = data.dailyLogs?.[today] || { sleep: 0, steps: 0 };

  const updateLog = (patch) => {
    setData({
      ...data,
      dailyLogs: { ...(data.dailyLogs || {}), [today]: { ...log, ...patch } }
    });
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Moon size={14} className="text-zinc-500" />
          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">Sleep</span>
        </div>
        <div className="flex items-baseline gap-1">
          <input
            type="number"
            step="0.5"
            value={log.sleep || ''}
            onChange={(e) => updateLog({ sleep: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            className="w-full bg-transparent text-xl font-bold text-white outline-none"
          />
          <span className="text-[10px] text-zinc-600 font-mono">hrs</span>
        </div>
      </Card>
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Footprints size={14} className="text-zinc-500" />
          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">Steps</span>
        </div>
        <div className="flex items-baseline gap-1">
          <input
            type="number"
            value={log.steps || ''}
            onChange={(e) => updateLog({ steps: parseInt(e.target.value) || 0 })}
            placeholder="0"
            className="w-full bg-transparent text-xl font-bold text-white outline-none"
          />
        </div>
      </Card>
    </div>
  );
}

// ---------- WORKOUTS TAB ----------
function WorkoutsTab({ data, setData }) {
  const [selectedSession, setSelectedSession] = useState('A');
  const [showLogForm, setShowLogForm] = useState(false);
  const [logMood, setLogMood] = useState(3);
  const [logNotes, setLogNotes] = useState('');
  const [logDuration, setLogDuration] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const sessions = data.customSessions || DEFAULT_SESSIONS;
  const session = sessions[selectedSession];
  const today = todayStr();
  const todaysWorkouts = data.workouts.filter(w => w.date === today);
  const alreadyLogged = todaysWorkouts.find(w => w.session === selectedSession);

  const logWorkout = () => {
    const newWorkout = {
      date: today,
      session: selectedSession,
      mood: logMood,
      notes: logNotes.trim(),
      duration: parseInt(logDuration) || 45,
      ts: Date.now(),
    };
    setData({ ...data, workouts: [...data.workouts, newWorkout] });
    setShowLogForm(false);
    setLogMood(3);
    setLogNotes('');
    setLogDuration('');
  };

  const removeWorkout = (ts) => {
    if (confirm('Remove this log?')) {
      setData({ ...data, workouts: data.workouts.filter(w => w.ts !== ts) });
    }
  };

  const recentWorkouts = [...data.workouts].sort((a, b) => b.ts - a.ts);

  // Get history per exercise (last 3 sessions of this type)
  const sessionHistory = data.workouts
    .filter(w => w.session === selectedSession)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="border-l-2 border-orange-500 pl-4">
        <div className="text-[10px] tracking-[0.25em] text-orange-500 uppercase font-mono mb-1">4 Sessions</div>
        <h1 className="text-3xl font-bold text-white">Train</h1>
        <p className="text-zinc-500 text-sm mt-2">Pick A, B, C, or D. Rotate however you want. Just hit 4/week.</p>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {Object.entries(sessions).map(([key, s]) => (
          <button
            key={key}
            onClick={() => setSelectedSession(key)}
            className={`py-3 text-xs font-mono tracking-wider transition-all border ${
              selectedSession === key
                ? 'bg-orange-500 text-black border-orange-500 font-bold'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-orange-500/50'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex justify-between items-baseline mb-2">
          <div className="text-[10px] font-mono tracking-wider text-orange-500">SESSION {selectedSession}</div>
          <div className="text-[10px] font-mono text-zinc-500">{session.duration}</div>
        </div>
        <h2 className="text-2xl font-bold text-white">{session.name}</h2>
        <p className="text-sm text-zinc-400 mt-2">{session.focus}</p>
      </Card>

      {!showLogForm ? (
        <button
          onClick={() => alreadyLogged ? removeWorkout(alreadyLogged.ts) : setShowLogForm(true)}
          className={`w-full py-4 font-black tracking-[0.2em] text-sm transition-all ${
            alreadyLogged ? 'bg-green-600 text-white' : 'bg-orange-500 text-black hover:bg-orange-400'
          }`}
        >
          {alreadyLogged ? '✓ LOGGED TODAY — TAP TO REMOVE' : 'LOG THIS WORKOUT'}
        </button>
      ) : (
        <Card className="p-5 border-orange-500/50 space-y-4">
          <div>
            <div className="text-[10px] font-mono tracking-wider text-orange-500 mb-2">HOW DID IT FEEL?</div>
            <StarRating value={logMood} onChange={setLogMood} size={24} />
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-wider text-zinc-500 mb-2">DURATION (MIN)</div>
            <input
              type="number"
              value={logDuration}
              onChange={(e) => setLogDuration(e.target.value)}
              placeholder="45"
              className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-wider text-zinc-500 mb-2">NOTES (OPTIONAL)</div>
            <textarea
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="Smashed pull-up PR. Knee felt tight. Whatever."
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-orange-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={logWorkout} className="flex-1">SAVE</Button>
            <Button variant="secondary" onClick={() => setShowLogForm(false)}>CANCEL</Button>
          </div>
        </Card>
      )}

      {/* History toggle */}
      {sessionHistory.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex justify-between items-center py-2 text-[10px] font-mono tracking-wider text-zinc-500 hover:text-orange-500"
          >
            <span>LAST {sessionHistory.length} × SESSION {selectedSession}</span>
            <ChevronRight size={14} className={`transition-transform ${showHistory ? 'rotate-90' : ''}`} />
          </button>
          {showHistory && (
            <div className="space-y-2 mt-2">
              {sessionHistory.map(w => (
                <Card key={w.ts} className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs font-mono text-zinc-400">{formatDate(w.date)}</div>
                    <div className="flex items-center gap-2">
                      <StarRating value={w.mood || 0} onChange={() => {}} size={10} />
                      <div className="text-[10px] font-mono text-zinc-600">{w.duration || 45}m</div>
                    </div>
                  </div>
                  {w.notes && <div className="text-xs text-zinc-500 italic mt-1">{w.notes}</div>}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <SectionHeader num="01">Exercises</SectionHeader>
        <div className="space-y-2">
          {session.exercises.map((ex, i) => (
            <Card key={i} className="p-4">
              <div className="flex justify-between items-baseline mb-2">
                <div className="text-sm font-bold text-white flex-1 pr-2">{ex.name}</div>
                <div className="text-[10px] font-mono text-orange-500 whitespace-nowrap">{ex.sets} × {ex.reps}</div>
              </div>
              <div className="text-xs text-zinc-400 italic">{ex.notes}</div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader num="02">All Recent Sessions</SectionHeader>
        {recentWorkouts.length === 0 ? (
          <Card className="p-5 text-center">
            <div className="text-xs text-zinc-500">No sessions logged yet. Start today.</div>
          </Card>
        ) : (
          <div className="space-y-1">
            {recentWorkouts.slice(0, 15).map((w) => {
              const sess = sessions[w.session];
              return (
                <div key={w.ts} className="flex justify-between items-center bg-zinc-900/50 border border-zinc-800 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono text-zinc-300">{formatDate(w.date)}</div>
                    <div className="text-[10px] font-mono text-orange-500">Session {w.session} · {sess?.name}</div>
                    {w.notes && <div className="text-[10px] text-zinc-500 italic mt-1 truncate">{w.notes}</div>}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {w.mood > 0 && <Star size={12} className="fill-orange-500 text-orange-500" />}
                    <button onClick={() => removeWorkout(w.ts)} className="text-zinc-600 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- PROGRESS TAB ----------
function ProgressTab({ data, setData }) {
  const [newWeight, setNewWeight] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [tab, setTab] = useState('weight');

  const { weights, measurements, profile } = data;

  const addWeight = () => {
    const w = parseFloat(newWeight);
    if (isNaN(w) || w < 30 || w > 200) {
      alert('Enter a realistic weight in kg');
      return;
    }
    const date = todayStr();
    const existing = weights.find(x => x.date === date);
    let newWeights;
    if (existing) {
      newWeights = weights.map(x => x.date === date ? { ...x, weight: w } : x);
    } else {
      newWeights = [...weights, { date, weight: w }].sort((a, b) => a.date.localeCompare(b.date));
    }
    setData({ ...data, weights: newWeights });
    setNewWeight('');
    setShowInput(false);
  };

  const chartData = weights.map(w => ({ date: w.date.slice(5), weight: w.weight }));
  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : profile.startWeight;
  const startWeight = weights.length > 0 ? weights[0].weight : profile.startWeight;
  const totalLost = (startWeight - currentWeight).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="border-l-2 border-orange-500 pl-4">
        <div className="text-[10px] tracking-[0.25em] text-orange-500 uppercase font-mono mb-1">Trajectory</div>
        <h1 className="text-3xl font-bold text-white">Progress</h1>
        <p className="text-zinc-500 text-sm mt-2">Weight weekly. Measurements monthly. The truth is in the trend.</p>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {[
          { k: 'weight', l: 'Weight' },
          { k: 'measure', l: 'Measurements' },
        ].map(s => (
          <button
            key={s.k}
            onClick={() => setTab(s.k)}
            className={`px-4 py-2 text-xs font-mono tracking-wider uppercase ${
              tab === s.k ? 'text-orange-500 border-b-2 border-orange-500' : 'text-zinc-500'
            }`}
          >
            {s.l}
          </button>
        ))}
      </div>

      {tab === 'weight' && (
        <>
          {!showInput ? (
            <button
              onClick={() => setShowInput(true)}
              className="w-full py-4 bg-orange-500 text-black font-black tracking-[0.2em] text-sm hover:bg-orange-400 flex items-center justify-center gap-2"
            >
              <Plus size={18} /> LOG TODAY'S WEIGHT
            </button>
          ) : (
            <Card className="p-5 border-orange-500/50">
              <div className="text-[10px] font-mono tracking-wider text-orange-500 mb-3">WEIGHT (KG)</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  autoFocus
                  placeholder="78.0"
                  className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-3 text-2xl font-bold text-white outline-none focus:border-orange-500"
                />
                <Button onClick={addWeight}>SAVE</Button>
                <Button variant="secondary" onClick={() => { setShowInput(false); setNewWeight(''); }}><X size={16} /></Button>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-3 gap-2">
            <Card className="p-3">
              <div className="text-[9px] font-mono tracking-wider text-zinc-500 mb-1">START</div>
              <div className="text-xl font-bold text-white">{startWeight}<span className="text-zinc-600 text-xs"> kg</span></div>
            </Card>
            <Card className="p-3">
              <div className="text-[9px] font-mono tracking-wider text-zinc-500 mb-1">NOW</div>
              <div className="text-xl font-bold text-white">{currentWeight}<span className="text-zinc-600 text-xs"> kg</span></div>
            </Card>
            <Card className="p-3">
              <div className="text-[9px] font-mono tracking-wider text-green-500 mb-1">LOST</div>
              <div className="text-xl font-bold text-green-400">{parseFloat(totalLost) > 0 ? '-' : ''}{Math.abs(totalLost)}<span className="text-zinc-600 text-xs"> kg</span></div>
            </Card>
          </div>

          {chartData.length >= 2 ? (
            <Card className="p-4">
              <div className="text-[10px] font-mono text-zinc-500 mb-3">
                {chartData.length} entries · target {profile.targetWeight}kg
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#52525b" tick={{ fontSize: 10 }} />
                  <YAxis
                    stroke="#52525b"
                    tick={{ fontSize: 10 }}
                    domain={[Math.min(profile.targetWeight - 2, ...chartData.map(d => d.weight)) - 1, Math.max(...chartData.map(d => d.weight)) + 1]}
                  />
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', fontSize: 12 }} />
                  <ReferenceLine y={profile.targetWeight} stroke="#22c55e" strokeDasharray="3 3" label={{ value: `${profile.targetWeight}kg`, fill: '#22c55e', fontSize: 10 }} />
                  <Area type="monotone" dataKey="weight" stroke="#f97316" strokeWidth={2} fill="url(#weightGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <TrendingDown size={32} className="text-zinc-700 mx-auto mb-3" />
              <div className="text-xs text-zinc-500">Log at least 2 weights to see the trend</div>
            </Card>
          )}

          {weights.length > 0 && (
            <div>
              <SectionHeader>History</SectionHeader>
              <div className="space-y-1">
                {[...weights].reverse().map((w, i) => {
                  const prev = weights[weights.length - i - 2];
                  const change = prev ? (w.weight - prev.weight).toFixed(1) : null;
                  return (
                    <div key={i} className="flex justify-between items-center bg-zinc-900/50 border border-zinc-800 px-4 py-3">
                      <div className="text-xs font-mono text-zinc-400">{formatDate(w.date)}</div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-bold text-white">{w.weight} kg</div>
                        {change !== null && (
                          <div className={`text-[10px] font-mono flex items-center gap-0.5 ${change < 0 ? 'text-green-400' : change > 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                            {change < 0 ? <ArrowDown size={10} /> : change > 0 ? <ArrowUp size={10} /> : null}
                            {Math.abs(change)}
                          </div>
                        )}
                        <button onClick={() => { if (confirm('Remove?')) setData({ ...data, weights: weights.filter(x => x.date !== w.date) }); }} className="text-zinc-600 hover:text-red-500">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'measure' && <MeasurementsView data={data} setData={setData} />}
    </div>
  );
}

// ---------- MEASUREMENTS ----------
function MeasurementsView({ data, setData }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ waist: '', chest: '', arms: '', thighs: '', hips: '' });

  const addMeasurement = () => {
    const m = {
      date: todayStr(),
      waist: parseFloat(form.waist) || null,
      chest: parseFloat(form.chest) || null,
      arms: parseFloat(form.arms) || null,
      thighs: parseFloat(form.thighs) || null,
      hips: parseFloat(form.hips) || null,
      ts: Date.now(),
    };
    setData({ ...data, measurements: [...data.measurements, m].sort((a, b) => a.date.localeCompare(b.date)) });
    setShowForm(false);
    setForm({ waist: '', chest: '', arms: '', thighs: '', hips: '' });
  };

  const latest = data.measurements[data.measurements.length - 1];
  const first = data.measurements[0];

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 bg-orange-500 text-black font-black tracking-[0.2em] text-sm hover:bg-orange-400 flex items-center justify-center gap-2"
        >
          <Ruler size={18} /> LOG MEASUREMENTS
        </button>
      ) : (
        <Card className="p-5 border-orange-500/50 space-y-3">
          <div className="text-[10px] font-mono tracking-wider text-orange-500 mb-2">ALL IN CM</div>
          {[
            { k: 'waist', l: 'Waist (at navel)' },
            { k: 'chest', l: 'Chest' },
            { k: 'arms', l: 'Arm (flexed)' },
            { k: 'thighs', l: 'Thigh' },
            { k: 'hips', l: 'Hips' },
          ].map(f => (
            <div key={f.k}>
              <div className="text-[10px] font-mono tracking-wider text-zinc-500 mb-1">{f.l.toUpperCase()}</div>
              <input
                type="number"
                step="0.5"
                value={form[f.k]}
                onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-orange-500"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="primary" onClick={addMeasurement} className="flex-1">SAVE</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>CANCEL</Button>
          </div>
        </Card>
      )}

      {latest && first && (
        <Card className="p-4">
          <div className="text-[10px] font-mono tracking-wider text-zinc-500 mb-3">LATEST vs FIRST</div>
          {['waist', 'chest', 'arms', 'thighs', 'hips'].map(k => {
            if (!latest[k] || !first[k]) return null;
            const diff = (latest[k] - first[k]).toFixed(1);
            return (
              <div key={k} className="flex justify-between items-baseline py-2 border-b border-zinc-800 last:border-0">
                <div className="text-sm text-white capitalize">{k}</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-xs text-zinc-500">{first[k]} → <span className="text-white font-bold">{latest[k]}</span> cm</div>
                  <div className={`text-xs font-mono ${diff < 0 ? 'text-green-400' : diff > 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {data.measurements.length > 0 && (
        <div>
          <SectionHeader>All Logs</SectionHeader>
          <div className="space-y-1">
            {[...data.measurements].reverse().map((m) => (
              <Card key={m.ts} className="p-3">
                <div className="flex justify-between items-baseline mb-2">
                  <div className="text-xs font-mono text-zinc-400">{formatDate(m.date)}</div>
                  <button onClick={() => { if (confirm('Remove?')) setData({ ...data, measurements: data.measurements.filter(x => x.ts !== m.ts) }); }} className="text-zinc-600 hover:text-red-500">
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {['waist', 'chest', 'arms', 'thighs', 'hips'].map(k => (
                    <div key={k}>
                      <div className="text-[9px] font-mono text-zinc-500 uppercase">{k}</div>
                      <div className="text-xs text-white">{m[k] || '—'}</div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- PHOTOS TAB ----------
function PhotosTab({ data, setData }) {
  const fileRef = useRef(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIdx, setCompareIdx] = useState(0);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize to reduce storage (max 800px)
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let { width, height } = img;
          if (width > height) {
            if (width > maxDim) { height = (height * maxDim) / width; width = maxDim; }
          } else {
            if (height > maxDim) { width = (width * maxDim) / height; height = maxDim; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

          setData(prev => ({
            ...prev,
            photos: [...prev.photos, { date: todayStr(), dataUrl, ts: Date.now() }].sort((a, b) => a.date.localeCompare(b.date))
          }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (ts) => {
    if (confirm('Delete this photo?')) {
      setData({ ...data, photos: data.photos.filter(p => p.ts !== ts) });
    }
  };

  const sortedPhotos = [...data.photos].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sortedPhotos[sortedPhotos.length - 1];
  const first = sortedPhotos[0];

  return (
    <div className="space-y-6">
      <div className="border-l-2 border-orange-500 pl-4">
        <div className="text-[10px] tracking-[0.25em] text-orange-500 uppercase font-mono mb-1">Visual Proof</div>
        <h1 className="text-3xl font-bold text-white">Photos</h1>
        <p className="text-zinc-500 text-sm mt-2">One photo every Sunday. The scale lies — these don't.</p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      <button
        onClick={() => fileRef.current.click()}
        className="w-full py-4 bg-orange-500 text-black font-black tracking-[0.2em] text-sm hover:bg-orange-400 flex items-center justify-center gap-2"
      >
        <Camera size={18} /> ADD PHOTO
      </button>

      {data.photos.length >= 2 && (
        <button
          onClick={() => setCompareMode(!compareMode)}
          className="w-full py-3 border border-zinc-800 text-zinc-400 text-xs font-mono tracking-wider hover:border-orange-500/50 hover:text-orange-500"
        >
          {compareMode ? 'CLOSE COMPARISON' : 'COMPARE FIRST vs LATEST'}
        </button>
      )}

      {compareMode && first && latest && first.ts !== latest.ts && (
        <Card className="p-4">
          <div className="text-[10px] font-mono tracking-wider text-orange-500 mb-3 text-center">SIDE-BY-SIDE</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="aspect-[3/4] bg-zinc-950 overflow-hidden">
                <img src={first.dataUrl} alt="first" className="w-full h-full object-cover" />
              </div>
              <div className="text-center mt-2">
                <div className="text-[9px] font-mono text-zinc-500">START</div>
                <div className="text-xs text-white">{formatDate(first.date)}</div>
              </div>
            </div>
            <div>
              <div className="aspect-[3/4] bg-zinc-950 overflow-hidden">
                <img src={latest.dataUrl} alt="latest" className="w-full h-full object-cover" />
              </div>
              <div className="text-center mt-2">
                <div className="text-[9px] font-mono text-orange-500">NOW</div>
                <div className="text-xs text-white">{formatDate(latest.date)}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {data.photos.length === 0 ? (
        <Card className="p-8 text-center">
          <ImageIcon size={32} className="text-zinc-700 mx-auto mb-3" />
          <div className="text-xs text-zinc-500 mb-2">No photos yet</div>
          <div className="text-[10px] font-mono text-zinc-600">Front, side, back. Same lighting. Same time. Weekly.</div>
        </Card>
      ) : (
        <div>
          <SectionHeader>Gallery</SectionHeader>
          <div className="grid grid-cols-2 gap-2">
            {sortedPhotos.reverse().map(p => (
              <div key={p.ts} className="relative group">
                <div className="aspect-[3/4] bg-zinc-950 overflow-hidden">
                  <img src={p.dataUrl} alt={p.date} className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <div className="text-[10px] font-mono text-white">{formatDate(p.date)}</div>
                </div>
                <button
                  onClick={() => removePhoto(p.ts)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white flex items-center justify-center"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- FOOD TAB ----------
function FoodTab() {
  return (
    <div className="space-y-6">
      <div className="border-l-2 border-orange-500 pl-4">
        <div className="text-[10px] tracking-[0.25em] text-orange-500 uppercase font-mono mb-1">No Tracking</div>
        <h1 className="text-3xl font-bold text-white">Food</h1>
        <p className="text-zinc-500 text-sm mt-2">No MyFitnessPal. No weighing. Just the template at every meal.</p>
      </div>

      <Card className="p-5 border-orange-500/30 bg-orange-500/5">
        <div className="text-[10px] font-mono tracking-wider text-orange-500 mb-3">THE PORTION SYSTEM</div>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3"><span className="text-orange-500 font-bold w-16">PALM</span><div className="text-zinc-300">protein per meal</div></div>
          <div className="flex gap-3"><span className="text-yellow-500 font-bold w-16">FIST</span><div className="text-zinc-300">carbs (rice, noodles)</div></div>
          <div className="flex gap-3"><span className="text-green-500 font-bold w-16">2 FISTS</span><div className="text-zinc-300">veg, every meal</div></div>
          <div className="flex gap-3"><span className="text-pink-500 font-bold w-16">THUMB</span><div className="text-zinc-300">fats (oil, nuts)</div></div>
        </div>
      </Card>

      <div>
        <SectionHeader num="01">Rules</SectionHeader>
        <div className="space-y-2">
          {FOOD_RULES.map((r, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-orange-500 font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                <div className="text-sm font-bold text-white">{r.rule}</div>
              </div>
              <div className="text-xs text-zinc-400 ml-7 leading-relaxed">{r.detail}</div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader num="02">Hawker — Go For</SectionHeader>
        <div className="space-y-2">
          {HAWKER_GOOD.map((h, i) => (
            <Card key={i} className="p-3">
              <div className="text-xs text-zinc-300 flex items-start gap-2">
                <span className="text-green-500 font-mono">✓</span>{h}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader num="03">Hawker — Avoid</SectionHeader>
        <div className="space-y-2">
          {HAWKER_BAD.map((h, i) => (
            <Card key={i} className="p-3">
              <div className="text-xs text-zinc-300 flex items-start gap-2">
                <span className="text-red-500">✕</span>{h}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- ACHIEVEMENTS TAB ----------
function AchievementsTab({ data }) {
  const { workouts, photos, measurements, weights, profile } = data;
  const startW = weights.length > 0 ? weights[0].weight : profile.startWeight;
  const currW = weights.length > 0 ? weights[weights.length - 1].weight : profile.startWeight;
  const weightLost = startW - currW;

  // Week streak calc
  const weekStreak = useMemo(() => {
    if (workouts.length === 0) return 0;
    const weekCounts = {};
    workouts.forEach(w => {
      const key = getMondayOfWeek(w.date).toISOString().slice(0, 10);
      weekCounts[key] = (weekCounts[key] || 0) + 1;
    });
    const weeks = Object.entries(weekCounts).sort((a, b) => b[0].localeCompare(a[0]));
    let count = 0;
    let currentMonday = getMondayOfWeek(new Date()).toISOString().slice(0, 10);
    for (const [date, c] of weeks) {
      if (date === currentMonday && c < 4) continue;
      if (c >= 4) count++;
      else break;
    }
    return count;
  }, [workouts]);

  const ctx = { workouts, weightLost, weekStreak, photos, measurements };

  return (
    <div className="space-y-6">
      <div className="border-l-2 border-orange-500 pl-4">
        <div className="text-[10px] tracking-[0.25em] text-orange-500 uppercase font-mono mb-1">Milestones</div>
        <h1 className="text-3xl font-bold text-white">Wins</h1>
        <p className="text-zinc-500 text-sm mt-2">Earn these by doing the work. Locked ones show what's possible.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ACHIEVEMENTS.map(a => {
          const earned = a.condition(ctx);
          return (
            <Card key={a.id} className={`p-4 text-center ${earned ? 'border-orange-500/40' : 'opacity-40'}`}>
              <div className="text-4xl mb-2">{earned ? a.icon : '🔒'}</div>
              <div className={`text-[10px] font-mono tracking-wider leading-tight ${earned ? 'text-orange-500' : 'text-zinc-500'}`}>{a.name}</div>
              <div className="text-[9px] text-zinc-600 mt-1 leading-tight">{a.detail}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ---------- COACH CHAT ----------
function CoachTab({ data, setData }) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messages = data.chatMessages || [];
  const scrollRef = useRef(null);

  // Personal stats sent to the coach so it can reference real numbers
  const stats = useMemo(() => {
    const { weights = [], workouts = [], profile = {} } = data;
    const currentWeight = weights.length ? weights[weights.length - 1].weight : profile.startWeight;
    const startWeight = weights.length ? weights[0].weight : profile.startWeight;
    const monday = getMondayOfWeek(new Date());
    const thisWeekWorkouts = workouts.filter(w => new Date(w.date) >= monday).length;
    const weekCounts = {};
    workouts.forEach(w => {
      const k = getMondayOfWeek(w.date).toISOString().slice(0, 10);
      weekCounts[k] = (weekCounts[k] || 0) + 1;
    });
    const weeks = Object.entries(weekCounts).sort((a, b) => b[0].localeCompare(a[0]));
    let weekStreak = 0;
    const cm = getMondayOfWeek(new Date()).toISOString().slice(0, 10);
    for (const [date, c] of weeks) {
      if (date === cm && c < 4) continue;
      if (c >= 4) weekStreak++; else break;
    }
    const num = (v) => (typeof v === 'number' && !isNaN(v) ? Number(v.toFixed(1)) : null);
    return {
      startWeight: startWeight ?? null,
      currentWeight: currentWeight ?? null,
      targetWeight: profile.targetWeight ?? null,
      weightLost: num((startWeight ?? 0) - (currentWeight ?? 0)),
      toGo: num((currentWeight ?? 0) - (profile.targetWeight ?? 0)),
      thisWeekWorkouts,
      weekStreak,
      totalWorkouts: workouts.length,
    };
  }, [data]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, sending]);

  const responses = {
    pull: 'Pull-ups are the most honest exercise. Right now they feel impossible. In 6 weeks they will feel easy. The path: band-assisted → negatives → 1 strict → more.',
    push: 'Push-ups carry your bodyweight. As you lose weight, they get easier on their own. Hardest variation you can do clean is the right one.',
    food: 'Forget tracking. Palm of protein + fist of carbs + 2 fists of veg at every meal. Done. The smoothie breakfast is gold. Lunch is hawker — half rice, no fried.',
    miss: "Bad day? Next day is normal. Bad meal? Next meal is normal. Never wait for Monday. Your average is what matters, not your worst day.",
    motivation: "You're not lacking motivation. You're lacking structure. Pick a time you'll train. Put it in calendar. Show up tired. The motivated version of you doesn't exist — only the disciplined one.",
    weight: "Weight is one signal, not the truth. Photos and measurements tell the real story. If the scale stalls but waist drops, you won. If the scale moves but photos don't change, something's wrong.",
    hawker: "Yong tau foo clear soup is the cleanest. Chicken rice steamed half rice is fine. Avoid char kway teow, hokkien mee, anything fried. The fried food won't kill you once a month. It'll kill you twice a week.",
    alcohol: "2 drinks max per occasion is your rule. Stick to it. Beer is calorie-dense, wine is fine in moderation, spirits with soda water + lime are cleanest. Sober is always better but sustainable beats perfect.",
    sleep: "7+ hours. Phone out of bedroom by 10:30. In a deficit, sleep protects muscle and sanity. Bad sleep = bad workout = bad food choices = bad day.",
    stuck: "Plateaus happen. First, check: are you actually eating like you think? Often 'just one thing' adds 300 cal/day. Second, increase steps. Third, take a refeed day (more carbs, same protein) — paradoxically helps.",
    default: "I'm a simple coach — I can riff on pull-ups, push-ups, food, hawker choices, alcohol, sleep, motivation, weight, plateaus, or missing days. What's on your mind?",
  };

  const findResponse = (text) => {
    const t = text.toLowerCase();
    if (t.includes('pull')) return responses.pull;
    if (t.includes('push')) return responses.push;
    if (t.includes('food') || t.includes('eat') || t.includes('macro') || t.includes('protein')) return responses.food;
    if (t.includes('miss') || t.includes('skip') || t.includes('fell off') || t.includes('quit')) return responses.miss;
    if (t.includes('motivat') || t.includes('lazy') || t.includes("don't feel")) return responses.motivation;
    if (t.includes('weight') || t.includes('scale') || t.includes('kg')) return responses.weight;
    if (t.includes('hawker') || t.includes('lunch') || t.includes('dinner')) return responses.hawker;
    if (t.includes('alcohol') || t.includes('drink') || t.includes('beer') || t.includes('wine')) return responses.alcohol;
    if (t.includes('sleep') || t.includes('tired')) return responses.sleep;
    if (t.includes('stuck') || t.includes('plateau') || t.includes('not losing')) return responses.stuck;
    return responses.default;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg = { role: 'user', text, ts: Date.now() };
    const base = [...messages, userMsg];
    setData(prev => ({ ...prev, chatMessages: base }));
    setInput('');
    setSending(true);
    try {
      const res = await fetch('/.netlify/functions/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: base, profile: data.profile, stats }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload.error || !payload.reply) {
        throw new Error(payload.error || 'Request failed');
      }
      const reply = { role: 'coach', text: payload.reply, ts: Date.now() + 1 };
      setData(prev => ({ ...prev, chatMessages: [...base, reply] }));
    } catch (e) {
      // Graceful fallback: canned answer so the coach still responds offline
      const reply = { role: 'coach', text: findResponse(text), ts: Date.now() + 1, offline: true };
      setData(prev => ({ ...prev, chatMessages: [...base, reply] }));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-l-2 border-orange-500 pl-4">
        <div className="text-[10px] tracking-[0.25em] text-orange-500 uppercase font-mono mb-1">AI Coach</div>
        <h1 className="text-3xl font-bold text-white">Coach</h1>
        <p className="text-zinc-500 text-sm mt-2">Your personal coach — knows your plan, weights, and streak. Ask anything.</p>
      </div>

      <Card className="p-3 border-orange-500/20 bg-orange-500/5">
        <div className="text-[10px] text-orange-300">
          Coaches training, food, and habits using your real numbers. Not a doctor — for medical/injury issues talk to a professional.
        </div>
      </Card>

      <div className="space-y-3 min-h-[300px]">
        {messages.length === 0 && (
          <div className="text-center text-zinc-500 text-xs py-8">
            Ask me anything — a workout swap, what to eat at the hawker, why the scale stalled, or how to get back on track.
          </div>
        )}
        {messages.map(m => (
          <div key={m.ts} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 text-sm whitespace-pre-wrap ${
              m.role === 'user' ? 'bg-orange-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
            }`}>
              {m.text}
              {m.offline && (
                <div className="text-[9px] font-mono text-zinc-500 mt-2 not-italic">offline answer — AI coach unreachable</div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 p-3 text-sm">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="flex gap-2 sticky bottom-20 bg-black pt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={sending ? 'Coach is thinking…' : 'Ask your coach...'}
          disabled={sending}
          className="flex-1 bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-white outline-none focus:border-orange-500 disabled:opacity-50"
        />
        <button onClick={send} disabled={sending} className="bg-orange-500 text-black px-4 py-3 disabled:opacity-50"><Send size={16} /></button>
      </div>
    </div>
  );
}

// ---------- SETTINGS TAB ----------
function SettingsTab({ data, setData, onReset }) {
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rebuild-backup-${todayStr()}.json`;
    a.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (confirm('Replace all current data with imported data?')) {
          setData(imported);
        }
      } catch (err) {
        alert('Invalid file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="border-l-2 border-orange-500 pl-4">
        <div className="text-[10px] tracking-[0.25em] text-orange-500 uppercase font-mono mb-1">Config</div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
      </div>

      <Card className="p-5 space-y-4">
        <div>
          <div className="text-[10px] font-mono tracking-wider text-zinc-500 mb-1">NAME</div>
          <input
            value={data.profile.name || ''}
            onChange={(e) => setData({ ...data, profile: { ...data.profile, name: e.target.value } })}
            className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <div className="text-[10px] font-mono tracking-wider text-zinc-500 mb-1">TARGET WEIGHT (KG)</div>
          <input
            type="number"
            step="0.1"
            value={data.profile.targetWeight}
            onChange={(e) => setData({ ...data, profile: { ...data.profile, targetWeight: parseFloat(e.target.value) || 68 } })}
            className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-orange-500"
          />
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-sm font-bold text-white mb-1">Backup Data</div>
        <div className="text-xs text-zinc-400 mb-4">Download everything as JSON. Restore later if you switch phones.</div>
        <div className="flex gap-2">
          <button onClick={exportData} className="flex-1 py-2 border border-zinc-700 text-white text-xs font-mono tracking-wider hover:border-orange-500 hover:text-orange-500 flex items-center justify-center gap-2">
            <Download size={14} /> EXPORT
          </button>
          <label className="flex-1 py-2 border border-zinc-700 text-white text-xs font-mono tracking-wider hover:border-orange-500 hover:text-orange-500 flex items-center justify-center gap-2 cursor-pointer">
            <Upload size={14} /> IMPORT
            <input type="file" accept="application/json" onChange={importData} className="hidden" />
          </label>
        </div>
      </Card>

      <Card className="p-5 border-red-900/50">
        <div className="text-sm font-bold text-red-500 mb-1">Reset Everything</div>
        <div className="text-xs text-zinc-400 mb-4">Clears all logs, weights, photos, measurements. Cannot be undone.</div>
        <button
          onClick={() => { if (confirm('Reset all data? This cannot be undone.')) onReset(); }}
          className="w-full py-2 border border-red-900 text-red-500 text-xs font-mono tracking-wider hover:bg-red-950/20 flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} /> RESET ALL DATA
        </button>
      </Card>

      <div className="text-center text-[10px] font-mono text-zinc-700 pt-4">
        REBUILD · v5.0<br />
        All data stored locally on this device
      </div>
    </div>
  );
}

// ---------- ROOT ----------
const INITIAL_DATA = {
  profile: { name: '', startWeight: DEFAULT_START_WEIGHT, targetWeight: DEFAULT_TARGET },
  weights: [],
  workouts: [],
  photos: [],
  measurements: [],
  dailyLogs: {},
  chatMessages: [],
  customSessions: null,
  onboarded: false,
};

export default function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [tab, setTab] = useState('home');
  const [loaded, setLoaded] = useState(false);

  // Load from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rebuild_data_v5');
      if (saved) setData({ ...INITIAL_DATA, ...JSON.parse(saved) });
    } catch (e) {}
    setLoaded(true);
  }, []);

  // Save to storage
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem('rebuild_data_v5', JSON.stringify(data));
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          alert('Storage full — try removing some photos or exporting and resetting.');
        }
      }
    }
  }, [data, loaded]);

  const completeOnboarding = (profile) => {
    setData({
      ...data,
      profile,
      weights: [{ date: todayStr(), weight: profile.startWeight }],
      onboarded: true,
    });
  };

  const resetAll = () => {
    localStorage.removeItem('rebuild_data_v5');
    setData(INITIAL_DATA);
  };

  if (!loaded) return <div className="min-h-screen bg-black" />;

  if (!data.onboarded) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const tabs = [
    { id: 'home', icon: <Flame size={18} />, label: 'Home' },
    { id: 'workouts', icon: <Dumbbell size={18} />, label: 'Train' },
    { id: 'progress', icon: <TrendingDown size={18} />, label: 'Progress' },
    { id: 'photos', icon: <Camera size={18} />, label: 'Photos' },
    { id: 'food', icon: <Apple size={18} />, label: 'Food' },
    { id: 'coach', icon: <MessageCircle size={18} />, label: 'Coach' },
    { id: 'wins', icon: <Trophy size={18} />, label: 'Wins' },
    { id: 'settings', icon: <Settings size={18} />, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
      <div className="max-w-md mx-auto pb-24">
        <div className="sticky top-0 bg-black/95 backdrop-blur z-10 border-b border-zinc-900 px-5 py-4">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[9px] tracking-[0.3em] text-orange-500 font-mono">REBUILD</div>
              <div className="text-xs font-mono text-zinc-500">The Anchor Plan · v5.0</div>
            </div>
            <div className="text-[10px] font-mono text-zinc-600">{new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}</div>
          </div>
        </div>

        <div className="px-5 pt-6">
          {tab === 'home' && <HomeTab data={data} setData={setData} navigateTo={setTab} />}
          {tab === 'workouts' && <WorkoutsTab data={data} setData={setData} />}
          {tab === 'progress' && <ProgressTab data={data} setData={setData} />}
          {tab === 'photos' && <PhotosTab data={data} setData={setData} />}
          {tab === 'food' && <FoodTab />}
          {tab === 'coach' && <CoachTab data={data} setData={setData} />}
          {tab === 'wins' && <AchievementsTab data={data} />}
          {tab === 'settings' && <SettingsTab data={data} setData={setData} onReset={resetAll} />}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-900 overflow-x-auto">
          <div className="max-w-md mx-auto grid grid-cols-8 min-w-[320px]">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`py-3 flex flex-col items-center gap-1 transition-all ${tab === t.id ? 'text-orange-500' : 'text-zinc-600'}`}
              >
                {t.icon}
                <span className="text-[7px] font-mono tracking-wider uppercase">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
