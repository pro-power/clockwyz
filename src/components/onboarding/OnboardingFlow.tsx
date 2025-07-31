// src/components/onboarding/OnboardingFlow.tsx
// Futuristic sci-fi themed onboarding for Clockwyz
// Lightning-fast 3-step setup with immediate schedule generation

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Zap, 
  ChevronRight, 
  BookOpen, 
  Briefcase, 
  Coffee,
  Sparkles,
  ArrowRight,
  Bot,
  Cpu
} from 'lucide-react';

// Quick preferences interface
export interface QuickPreferences {
  userType: 'student' | 'working-student' | 'professional';
  weekStart: 'sunday' | 'monday' | 'tuesday';
  schedulePattern: 'early' | 'standard' | 'night' | 'custom';
}

interface OnboardingFlowProps {
  onComplete: (preferences: QuickPreferences) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [preferences, setPreferences] = useState<Partial<QuickPreferences>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const }
    },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  const glowVariants = {
    initial: { opacity: 0.5, scale: 1 },
    animate: { 
      opacity: [0.5, 1, 0.5], 
      scale: [1, 1.05, 1],
      transition: { 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  const handleComplete = async () => {
    setIsGenerating(true);
    
    // Simulate AI schedule generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onComplete(preferences as QuickPreferences);
  };

  const WelcomeStep = () => (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 30, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div 
        className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-slate-700/50 relative"
        variants={cardVariants}
      >
        {/* Glow effect */}
        <motion.div 
          className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-lg"
          variants={glowVariants}
          initial="initial"
          animate="animate"
        />
        
        <div className="relative z-10">
          <motion.div 
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 relative"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Cpu className="w-10 h-10 text-white" />
            </motion.div>
            <motion.div 
              className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-3xl blur-md"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Welcome to Clockwyz
          </motion.h1>
          
          <motion.p 
            className="text-slate-300 mb-8 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            AI-powered schedule optimization in <span className="text-blue-400 font-semibold">under 60 seconds</span>
          </motion.p>
          
          <motion.button 
            onClick={() => setCurrentStep('userType')}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center justify-center gap-3 text-lg shadow-lg"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Sparkles className="w-5 h-5" />
            Initialize Schedule Matrix
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  const UserTypeStep = () => (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <motion.div 
        className="max-w-2xl w-full bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-700/50 relative"
        variants={cardVariants}
      >
        <motion.div 
          className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-lg"
          variants={glowVariants}
          initial="initial"
          animate="animate"
        />
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <motion.div
              className="flex items-center justify-center gap-2 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Bot className="w-6 h-6 text-blue-400" />
              <span className="text-blue-400 font-medium">Step 1 of 3</span>
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-3">Select Your Profile Type</h2>
            <p className="text-slate-300">This optimizes your AI schedule matrix</p>
          </div>
          
          <div className="space-y-4">
            {[
              { 
                id: 'student', 
                icon: BookOpen, 
                label: 'Student', 
                desc: 'Classes, assignments, study optimization',
                gradient: 'from-emerald-500 to-blue-500'
              },
              { 
                id: 'working-student', 
                icon: Briefcase, 
                label: 'Working Student', 
                desc: 'Balance work shifts with academic demands',
                gradient: 'from-orange-500 to-red-500'
              },
              { 
                id: 'professional', 
                icon: Coffee, 
                label: 'Professional', 
                desc: 'Meetings, projects, productivity focus',
                gradient: 'from-purple-500 to-indigo-500'
              }
            ].map((type, index) => (
              <motion.button
                key={type.id}
                onClick={() => {
                  setPreferences(prev => ({ ...prev, userType: type.id as any }));
                  setCurrentStep('weekStart');
                }}
                className="w-full p-6 rounded-2xl border border-slate-600/50 transition-all text-left hover:border-blue-500/50 hover:bg-slate-700/30 group relative overflow-hidden"
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-r ${type.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <type.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors">
                      {type.label}
                    </h3>
                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                      {type.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 ml-auto group-hover:text-blue-400 transition-colors" />
                </div>
                
                {/* Hover glow effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const WeekStartStep = () => (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div 
        className="max-w-2xl w-full bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-700/50 relative"
        variants={cardVariants}
      >
        <motion.div 
          className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-lg"
          variants={glowVariants}
          initial="initial"
          animate="animate"
        />
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <motion.div
              className="flex items-center justify-center gap-2 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Calendar className="w-6 h-6 text-blue-400" />
              <span className="text-blue-400 font-medium">Step 2 of 3</span>
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-3">Week Start Configuration</h2>
            <p className="text-slate-300">When does your planning cycle begin?</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'sunday', label: 'Sunday', popular: false, desc: 'Traditional' },
              { id: 'monday', label: 'Monday', popular: true, desc: 'Most Popular' },
              { id: 'tuesday', label: 'Tuesday', popular: false, desc: 'Alternative' }
            ].map((day, index) => (
              <motion.button
                key={day.id}
                onClick={() => {
                  setPreferences(prev => ({ ...prev, weekStart: day.id as any }));
                  setCurrentStep('scheduleType');
                }}
                className="p-6 rounded-2xl border border-slate-600/50 transition-all text-center relative group hover:border-blue-500/50 hover:bg-slate-700/30"
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {day.popular && (
                  <motion.div 
                    className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    Popular
                  </motion.div>
                )}
                
                <div className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors">
                  {day.label}
                </div>
                <div className="text-slate-400 text-sm mt-1">
                  {day.desc}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const ScheduleTypeStep = () => (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div 
        className="max-w-2xl w-full bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-700/50 relative"
        variants={cardVariants}
      >
        <motion.div 
          className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-lg"
          variants={glowVariants}
          initial="initial"
          animate="animate"
        />
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <motion.div
              className="flex items-center justify-center gap-2 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Clock className="w-6 h-6 text-blue-400" />
              <span className="text-blue-400 font-medium">Step 3 of 3</span>
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-3">Temporal Pattern Selection</h2>
            <p className="text-slate-300">Choose your optimal energy distribution</p>
          </div>
          
          <div className="space-y-4">
            {[
              { 
                id: 'early', 
                label: 'Early Protocol', 
                time: '6am - 6pm', 
                desc: 'Maximum morning productivity',
                icon: '🌅'
              },
              { 
                id: 'standard', 
                label: 'Standard Matrix', 
                time: '8am - 8pm', 
                desc: 'Balanced energy distribution',
                icon: '⚖️'
              },
              { 
                id: 'night', 
                label: 'Nocturnal Mode', 
                time: '10am - 10pm', 
                desc: 'Peak evening performance',
                icon: '🌙'
              },
              { 
                id: 'custom', 
                label: 'Custom Algorithm', 
                time: 'Adaptive', 
                desc: 'AI-generated optimization',
                icon: '🤖'
              }
            ].map((schedule, index) => (
              <motion.button
                key={schedule.id}
                onClick={() => {
                  setPreferences(prev => ({ ...prev, schedulePattern: schedule.id as any }));
                  handleComplete();
                }}
                className="w-full p-6 rounded-2xl border border-slate-600/50 transition-all text-left hover:border-blue-500/50 hover:bg-slate-700/30 group relative overflow-hidden"
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{schedule.icon}</div>
                    <div>
                      <h3 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors">
                        {schedule.label}
                      </h3>
                      <p className="text-blue-400 font-medium">{schedule.time}</p>
                      <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                        {schedule.desc}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
                
                {/* Hover glow effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const GeneratingStep = () => (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div 
        className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-slate-700/50 relative"
        variants={cardVariants}
      >
        <motion.div 
          className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-3xl blur-lg"
          animate={{ 
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <div className="relative z-10">
          <motion.div 
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6"
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity }
            }}
          >
            <Cpu className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-3">Generating Your Schedule</h2>
          <p className="text-slate-300 mb-6">AI is optimizing your temporal matrix...</p>
          
          <div className="space-y-3 text-left">
            {[
              'Analyzing productivity patterns...',
              'Optimizing energy distribution...',
              'Calculating temporal efficiency...',
              'Finalizing schedule matrix...'
            ].map((text, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 text-slate-400"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.5 }}
              >
                <motion.div
                  className="w-2 h-2 bg-blue-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ 
                    delay: index * 0.5,
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                />
                {text}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const steps = {
    welcome: WelcomeStep,
    userType: UserTypeStep,
    weekStart: WeekStartStep,
    scheduleType: ScheduleTypeStep,
    generating: GeneratingStep
  };

  return (
    <AnimatePresence mode="wait">
      {isGenerating ? (
        <GeneratingStep key="generating" />
      ) : (
        React.createElement(steps[currentStep as keyof typeof steps], { key: currentStep })
      )}
    </AnimatePresence>
  );
};

export default OnboardingFlow;