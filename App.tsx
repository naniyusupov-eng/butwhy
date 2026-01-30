import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, Animated, Dimensions, Dimensions as ScreenDimensions, Image, ScrollView, Platform, Alert, Modal, TextInput, KeyboardAvoidingView, PanResponder, Keyboard } from 'react-native';
import { BlurView } from 'expo-blur';
import { useFonts } from 'expo-font';
import { useEffect, useRef, useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';

const { width, height } = Dimensions.get('window');

const AnimatedImage = Animated.createAnimatedComponent(ExpoImage);

// --- Context / Global State Simulation ---
// In a real app, use Context. Here we just use props/state.

// --- Types ---
type OnboardingStep =
  | 'intro1' // The Nihilist Penguin Problem
  | 'intro2' // But What If You Had a Reason?
  | 'welcome'
  | 'q1' // Main reason
  | 'q2' // Primary area
  | 'q3' // Challenge
  | 'q4' // How many habits
  | 'q5' // Failure reason
  | 'q6' // Time dedication
  | 'reminder' // Notification time
  | 'loading' // AI generation simulation
  | 'firstHabit' // Create First Habit
  | 'success' // Success Moment
  | 'paywall' // Paywall
  | 'dashboard'
  | 'stats';

interface Habit {
  id: string;
  title: string;
  emoji: string;
  time?: string;
  completed?: boolean;
}

interface OnboardingData {
  nihilistReason: string;
  transformationType: string;
  habitFocus: string[];
  timeline: 7 | 30 | 55 | 100;
  reminderTime: string;
  startDate: Date;
  day1Habits: Habit[];
  habitHistory: Record<string, string[]>;
}

// --- Constants ---
const PRIMARY_COLOR = '#2b908f';
const SECONDARY_COLOR = '#ff3131';

const Q1_OPTIONS = [
  { id: 'build', title: 'Build a new healthy habit', emoji: '✨' },
  { id: 'break', title: 'Break a bad habit', emoji: '🚫' },
  { id: 'track', title: 'Track my daily progress', emoji: '📊' },
  { id: 'improve', title: 'Improve mental & physical health', emoji: '🧘' },
];

const Q2_OPTIONS = [
  { id: 'mindset', title: 'Mindset & Mindfulness', emoji: '🧠', suggestion: '10 min Meditation' },
  { id: 'health', title: 'Health & Fitness', emoji: '💪', suggestion: 'Drink 2L Water' },
  { id: 'productivity', title: 'Productivity & Focus', emoji: '⚡', suggestion: 'Read for 20 mins' },
  { id: 'growth', title: 'Personal Growth', emoji: '🌱', suggestion: 'Write 3 Gratitudes' },
];

const Q3_OPTIONS = [
  { id: 'consistency', title: 'Staying consistent', emoji: '📈' },
  { id: 'motivation', title: 'Finding motivation', emoji: '🔥' },
  { id: 'time', title: 'Time management', emoji: '⏰' },
  { id: 'forgetting', title: 'Simply forgetting', emoji: '🤔' },
];

const Q4_OPTIONS = [
  { id: 7, title: '7 Days (Trial)', emoji: '🎯' },
  { id: 30, title: '30 Days (Commitment)', emoji: '⚖️' },
  { id: 55, title: '55 Days (Transformation)', emoji: '🦅' },
  { id: 100, title: '100 Days (Mastery)', emoji: '🔥' },
];

const Q5_OPTIONS = [
  { id: 'chaos', title: 'Morning Chaos', emoji: '🌪️' },
  { id: 'fatigue', title: 'After Work Fatigue', emoji: '🔋' },
  { id: 'scroll', title: 'Doom Scrolling', emoji: '📱' },
  { id: 'lazy', title: 'Weekend Inconsistency', emoji: '🛋️' },
];

const Q6_OPTIONS = [
  { id: '5min', title: '5-10 Mins / Day', emoji: '⚡' },
  { id: '15min', title: '15-30 Mins / Day', emoji: '⏱️' },
  { id: '30min', title: '30-60 Mins / Day', emoji: '⏳' },
  { id: '1hr', title: '1+ Hour / Day', emoji: '🏆' },
];

// --- Components ---
let styles: any;


const ProgressBar = ({ progress }: { progress: number }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: progress,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.progressContainer}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            width: widthAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            })
          }
        ]}
      />
    </View>
  );
};

const FadeInView = ({ children, style, delay = 0, yOffset = 25 }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(yOffset)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 30,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, style]}>
      {children}
    </Animated.View>
  );
};

// --- Specialized Screen Components ---

const AnimatedText = ({ text, style }: { text: string, style: any }) => {
  const lines = text.split('\n');
  return (
    <Text style={style}>
      {lines.map((line, i) => (
        <Text key={i}>
          {line}{i !== lines.length - 1 ? '\n' : ''}
        </Text>
      ))}
    </Text>
  );
};

const CinematicIntro = ({
  imageSource,
  tag,
  title,
  caption,
  buttonText,
  buttonIcon,
  onPress
}: any) => {
  const zoomAnim = useRef(new Animated.Value(1.3)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [displayedCaption, setDisplayedCaption] = useState('');
  const [isTitleComplete, setIsTitleComplete] = useState(false);
  const [isCaptionComplete, setIsCaptionComplete] = useState(false);

  useEffect(() => {
    setDisplayedTitle('');
    setDisplayedCaption('');
    setIsTitleComplete(false);
    setIsCaptionComplete(false);
    buttonOpacity.setValue(0);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= title.length) {
        setDisplayedTitle(title.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTitleComplete(true);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [title]);

  useEffect(() => {
    if (isTitleComplete && caption) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= caption.length) {
          setDisplayedCaption(caption.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsCaptionComplete(true);
        }
      }, 20);
      return () => clearInterval(interval);
    } else if (isTitleComplete && !caption) {
      setIsCaptionComplete(true);
    }
  }, [isTitleComplete, caption]);

  useEffect(() => {
    if (isCaptionComplete) {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }).start();
    }
  }, [isCaptionComplete]);

  useEffect(() => {
    const animation = Animated.timing(zoomAnim, {
      toValue: 1.05,
      duration: 6000,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: '#000' }]}>
      <View style={styles.cinematicBgContainer}>
        <AnimatedImage
          source={imageSource}
          style={[styles.introImageEpic, { transform: [{ scale: zoomAnim }] }]}
          contentFit="cover"
          transition={0}
          priority="high"
          cachePolicy="memory-disk"
        />
      </View>
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.4, 0.9]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.introContentLayout}>
        <View style={styles.introHeaderSection}>
          <Text style={styles.cinematicTag}>{tag}</Text>
          <View>
            <AnimatedText text={title} style={[styles.cinematicTitle, { opacity: 0 }]} />
            <View style={StyleSheet.absoluteFill}>
              <AnimatedText text={displayedTitle} style={styles.cinematicTitle} />
            </View>
          </View>
        </View>

        <View style={styles.introFooterSection}>
          <View style={[styles.dividerSmall, { opacity: isTitleComplete ? 1 : 0 }]} />

          <View>
            <AnimatedText text={caption} style={[styles.cinematicCaption, { opacity: 0 }]} />
            {isTitleComplete && (
              <View style={StyleSheet.absoluteFill}>
                <AnimatedText text={displayedCaption} style={styles.cinematicCaption} />
              </View>
            )}
          </View>

          <Animated.View style={{ opacity: buttonOpacity }}>
            <Pressable
              style={styles.premiumButton}
              onPress={isCaptionComplete ? onPress : null}
              disabled={!isCaptionComplete}
            >
              <Text style={styles.premiumButtonText}>{buttonText}</Text>
              <Feather name={buttonIcon as any} size={18} color="#000" style={{ marginLeft: 8 }} />
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};



const SuccessScreen = ({ onDashboard }: { onDashboard: () => void }) => (
  <CinematicIntro
    imageSource={require('./assets/success_moment.png')}
    tag="CONGRATULATIONS"
    title={"TRANSFORMATION\nINITIALIZED"}
    caption={'"The penguin sees the light.\nYou are no longer bound by gravity."'}
    buttonText="START EVOLUTION"
    buttonIcon="zap"
    onPress={onDashboard}
  />
);

const FirstHabitScreen = ({ onboarding, onActivate }: { onboarding: any, onActivate: () => void }) => {
  const suggestedHabit = onboarding.day1Habits.find((h: any) => h.id === 'suggested');

  return (
    <View style={[styles.screen, { backgroundColor: '#000' }]}>
      <Image
        source={require('./assets/pattern_bg.png')}
        style={[StyleSheet.absoluteFill, { opacity: 0.08 }]}
        resizeMode="repeat"
      />

      {/* Background Ambience */}
      <LinearGradient
        colors={['rgba(43, 144, 143, 0.25)', 'transparent', 'rgba(0,0,0,0.95)']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.screen, { padding: 30, justifyContent: 'space-between' }]}>
        {/* Mysterious Header */}
        <FadeInView style={{ marginTop: 60, alignItems: 'center' }} yOffset={30}>
          <View style={styles.catalystBadge}>
            <Text style={styles.catalystBadgeText}>LEVEL 01</Text>
          </View>
          <Text style={styles.cinematicTag}>THE GENESIS</Text>
          <AnimatedText
            text={"Your Personal\nCatalyst"}
            style={[styles.cinematicTitle, { textAlign: 'center', fontSize: 34, lineHeight: 42 }]}
          />
        </FadeInView>

        {/* The Core Habit Visual */}
        <FadeInView style={styles.imageOverlayContainer} yOffset={40}>
          <View style={styles.catalystMainCard}>
            <View style={styles.catalystIconOuter}>
              <View style={styles.catalystIconInner}>
                <Text style={{ fontSize: 44 }}>{suggestedHabit?.emoji || '✨'}</Text>
              </View>
            </View>

            <Text style={styles.catalystHabitTitle}>
              {suggestedHabit?.title || 'Daily Track'}
            </Text>

            <View style={styles.catalystDivider} />

            <Text style={styles.catalystDescription}>
              "The first domino in your evolution. Master this, and the sky becomes your limit."
            </Text>
          </View>
        </FadeInView>

        {/* Action Section */}
        <FadeInView style={{ marginBottom: 50, alignItems: 'center' }} yOffset={20}>
          <Pressable
            style={[styles.premiumButton, { width: '100%' }]}
            onPress={onActivate}
          >
            <View style={styles.buttonCenterContent}>
              <Text style={styles.premiumButtonText}>ACTIVATE CATALYST</Text>
              <Feather name="zap" size={16} color="#000" style={{ marginLeft: 10 }} />
            </View>
          </Pressable>
          <Text style={styles.activationHint}>55 days until total transformation</Text>
        </FadeInView>
      </View>
    </View>
  );
};

const QuestionScreen = ({ title, options, currentStep, next, progress, onNext }: any) => (
  <View style={[styles.screen, { backgroundColor: '#000' }]}>
    <Image
      source={require('./assets/pattern_bg.png')}
      style={[StyleSheet.absoluteFill, { opacity: 0.05 }]}
      resizeMode="repeat"
    />
    <LinearGradient
      colors={['rgba(43, 144, 143, 0.1)', 'transparent']}
      style={StyleSheet.absoluteFill}
    />
    <FadeInView style={styles.header} yOffset={25}>
      <ProgressBar progress={progress} />
      <AnimatedText text={title} style={[styles.questionTitle, { color: '#fff' }]} />
    </FadeInView>
    <FadeInView style={{ flex: 1 }} yOffset={30}>
      <ScrollView contentContainerStyle={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        {options.map((option: any) => (
          <Pressable
            key={option.id}
            style={styles.optionCard}
            onPress={() => onNext(currentStep, next, option.id)}
          >
            <Text style={styles.optionEmoji}>{option.emoji}</Text>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionText}>{option.title}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </FadeInView>
  </View>
);

const NotificationScreen = ({ progress, notificationTime, showTimePicker, onTimePress, onTimeChange, onConfirm }: any) => (
  <View style={[styles.screen, { backgroundColor: '#000' }]}>
    <Image
      source={require('./assets/pattern_bg.png')}
      style={[StyleSheet.absoluteFill, { opacity: 0.05 }]}
      resizeMode="repeat"
    />
    <LinearGradient
      colors={['rgba(43, 144, 143, 0.1)', 'transparent']}
      style={StyleSheet.absoluteFill}
    />
    <FadeInView style={styles.header} yOffset={25}>
      <ProgressBar progress={progress} />
      <AnimatedText text={"When should we\nremind you?"} style={[styles.questionTitle, { color: '#fff' }]} />
      <Text style={[styles.questionSubtitle, { color: 'rgba(255,255,255,0.5)' }]}>Timing is key for consistency. Most users prefer morning reminders.</Text>
    </FadeInView>

    <FadeInView style={styles.timePickerContainer} yOffset={30}>
      {Platform.OS === 'android' && (
        <Pressable style={[styles.timeDisplay, { backgroundColor: 'rgba(255,255,255,0.05)' }]} onPress={onTimePress}>
          <Text style={styles.timeText}>
            {notificationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Pressable>
      )}

      {showTimePicker && (
        <DateTimePicker
          value={notificationTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
          themeVariant="dark"
        />
      )}
    </FadeInView>

    <FadeInView style={styles.footer} yOffset={20}>
      <Pressable
        style={styles.premiumButton}
        onPress={onConfirm}
      >
        <Text style={styles.premiumButtonText}>Enable Notifications</Text>
        <Feather name="bell" size={16} color="#000" style={{ marginLeft: 10 }} />
      </Pressable>
    </FadeInView>
  </View>
);

const LoadingScreen = ({ transformationType }: { transformationType: string }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.screen, styles.center, { backgroundColor: '#000' }]}>
      <Animated.View style={[styles.loadingCircle, { transform: [{ rotate: spin }] }]} />
      <FadeInView delay={300} yOffset={10}>
        <Text style={styles.loadingText}>
          Tailoring your {transformationType || 'personal'} journey...
        </Text>
      </FadeInView>
    </View>
  );
};

const PaywallScreen = ({ visible, onContinue }: { visible: boolean; onContinue: () => void }) => {
  const [selectedPlan, setSelectedPlan] = useState('yearly_trial');
  const [modalY] = useState(new Animated.Value(height));

  const PLANS = [
    { id: 'weekly_trial', title: 'Weekly Sprint', sub: '$4.99 / Week', mainPrice: '3 DAYS FREE', footer: 'Try Risk Free', badge: null },
    { id: 'monthly_trial', title: 'Monthly Habit', sub: '$9.99 / Month', mainPrice: '3 DAYS FREE', footer: 'Cancel Anytime', badge: null },
    { id: 'quarterly', title: 'Quarterly Routine', sub: '$29.99 / Quarter', mainPrice: '$2.49', footer: 'per week', badge: null },
    { id: 'yearly', title: 'Yearly Evolution', sub: '$59.99 / Year', mainPrice: '$1.15', footer: 'per week', badge: 'POPULAR' },
    { id: 'lifetime', title: 'Eternal Mindset', sub: 'Lifetime Access', mainPrice: '$149.99', footer: 'one-time', badge: 'LEGACY' },
  ];

  const FEATURES = [
    { icon: 'activity', text: 'Infinite Habit Transformation' },
    { icon: 'trending-up', text: 'Deep Evolution Analytics' },
    { icon: 'eye', text: 'Cinematic Daily Insights' },
    { icon: 'shield', text: '100% Evolution Guarantee' },
  ];

  useEffect(() => {
    if (visible) {
      Animated.spring(modalY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 25,
        friction: 10
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.paywallSheet, { transform: [{ translateY: modalY }] }]}>
          {/* Background Layering */}
          <Image
            source={require('./assets/opium_bird.png')}
            style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
          />
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)', '#000']}
            style={StyleSheet.absoluteFill}
          />

          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 45 : 20, paddingBottom: 0 }}>

            {/* Close Button Top Right - Simplified */}
            <Pressable
              onPress={onContinue}
              style={{
                position: 'absolute', top: 55, right: 24,
                zIndex: 100
              }}
            >
              <Feather name="x" size={24} color="rgba(255,255,255,0.4)" />
            </Pressable>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>

              {/* Header Section - Lifted Even Higher */}
              <View style={{ alignItems: 'center', marginTop: 0, marginBottom: 60 }}>
                <Text style={{
                  color: '#fff', fontSize: 38, fontFamily: 'Garet-Heavy',
                  textAlign: 'center', lineHeight: 42, letterSpacing: -0.5
                }}>
                  Unlimited Access
                </Text>
              </View>

              {/* Features List Section - Increased margin bottom */}
              <View style={{ paddingHorizontal: 10, marginBottom: 25, gap: 10 }}>
                {FEATURES.map((f, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 20, alignItems: 'center', marginRight: 12 }}>
                      <Feather name={f.icon as any} size={16} color={PRIMARY_COLOR} />
                    </View>
                    <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Garet-Book', opacity: 0.8 }}>
                      {f.text}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Plans Section - Compact Gap */}
              <View style={{ gap: 8, marginBottom: 20 }}>
                {PLANS.map((plan) => (
                  <Pressable
                    key={plan.id}
                    style={{
                      flexDirection: 'row',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderRadius: 14,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderWidth: selectedPlan === plan.id ? 2 : 1,
                      borderColor: selectedPlan === plan.id ? PRIMARY_COLOR : 'rgba(255,255,255,0.1)',
                      alignItems: 'center',
                      position: 'relative'
                    }}
                    onPress={() => setSelectedPlan(plan.id)}
                  >
                    {plan.badge && (
                      <View style={{
                        position: 'absolute', top: -8, right: 20,
                        backgroundColor: '#ff4b5c', paddingHorizontal: 8,
                        paddingVertical: 2, borderRadius: 8, zIndex: 10
                      }}>
                        <Text style={{ color: '#fff', fontSize: 8, fontFamily: 'Garet-Heavy' }}>{plan.badge}</Text>
                      </View>
                    )}

                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Garet-Heavy' }}>{plan.title}</Text>
                      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Garet-Book' }}>{plan.sub}</Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{
                        color: plan.mainPrice.includes('FREE') ? PRIMARY_COLOR : '#fff',
                        fontSize: 16, fontFamily: 'Garet-Heavy'
                      }}>
                        {plan.mainPrice}
                      </Text>
                      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'Garet-Book' }}>{plan.footer}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>

              {/* CTA Section - Compact height */}
              <View>
                <Pressable
                  style={{
                    height: 52,
                    borderRadius: 26,
                    overflow: 'hidden',
                  }}
                  onPress={onContinue}
                >
                  <LinearGradient
                    colors={[PRIMARY_COLOR, '#1e6b6a']}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Garet-Heavy' }}>START TRAINING NOW</Text>
                  </LinearGradient>
                </Pressable>

                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 15, marginBottom: 10 }}>
                  <Pressable hitSlop={10}><Text style={[styles.legalTextMini, { opacity: 0.4 }]}>Terms</Text></Pressable>
                  <Pressable hitSlop={10}><Text style={[styles.legalTextMini, { opacity: 0.4 }]}>Privacy</Text></Pressable>
                  <Pressable hitSlop={10}><Text style={[styles.legalTextMini, { opacity: 0.4 }]}>Restore</Text></Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// --- Main App ---

export default function App() {
  const [step, setStep] = useState<OnboardingStep>('intro1');
  const [onboarding, setOnboarding] = useState<OnboardingData>({
    nihilistReason: '',
    transformationType: '',
    habitFocus: [],
    timeline: 55,
    reminderTime: '',
    startDate: new Date(),
    day1Habits: [
      { id: '1', title: 'Exercise', emoji: '💪' },
      { id: '2', title: 'Meditation', emoji: '🧘' },
      { id: '3', title: 'Sleep (10pm-6am)', emoji: '🌙' },
    ],
    habitHistory: {},
  });
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');

  const [isReady, setIsReady] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const panY = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAddModalVisible) {
      // Entry Animation
      Animated.parallel([
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 40,
          friction: 8
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [isAddModalVisible]);

  const resetPanY = () => {
    Animated.spring(panY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 8
    }).start();
  };

  const consolidatedClose = () => {
    Animated.parallel([
      Animated.timing(panY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setIsAddModalVisible(false);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          consolidatedClose();
        } else {
          resetPanY();
        }
      },
    })
  ).current;

  const getAutoEmoji = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('run') || t.includes('jog') || t.includes('walk')) return '🏃';
    if (t.includes('read') || t.includes('book') || t.includes('study')) return '📚';
    if (t.includes('water') || t.includes('drink') || t.includes('hydrate')) return '💧';
    if (t.includes('gym') || t.includes('workout') || t.includes('train') || t.includes('physic')) return '💪';
    if (t.includes('meditat') || t.includes('zen') || t.includes('breath') || t.includes('yoga')) return '🧘';
    if (t.includes('sleep') || t.includes('bed') || t.includes('night')) return '😴';
    if (t.includes('eat') || t.includes('food') || t.includes('meal') || t.includes('diet')) return '🍎';
    if (t.includes('cod') || t.includes('program') || t.includes('dev')) return '💻';
    if (t.includes('money') || t.includes('save') || t.includes('invest') || t.includes('budget')) return '💰';
    if (t.includes('pray') || t.includes('spirit') || t.includes('god')) return '🙏';
    if (t.includes('clean') || t.includes('room') || t.includes('house')) return '🧹';
    if (t.includes('write') || t.includes('journal') || t.includes('diar')) return '✍️';
    if (t.includes('art') || t.includes('draw') || t.includes('paint')) return '🎨';
    if (t.includes('music') || t.includes('play') || t.includes('sing')) return '🎵';
    if (t.includes('smoke') || t.includes('quit') || t.includes('stop')) return '🚭';
    return '✨'; // Default premium icon
  };

  useEffect(() => {
    async function prepare() {
      try {
        const imageAssets = [
          require('./assets/nihilist_penguin.png'),
          require('./assets/opium_bird.png'),
          require('./assets/welcome_visual.png'),
          require('./assets/pattern_bg.png'),
          require('./assets/success_moment.png'),
          require('./assets/evolution-img-1.png'),
          require('./assets/evolution-img-2.png'),
          require('./assets/evolution-img-3.png'),
          require('./assets/evolution-img-4.png'),
        ];

        const fontAssets = {
          'Garet-Heavy': require('./Fonts/Garet-Heavy.ttf'),
          'Garet-Book': require('./Fonts/Garet-Book.ttf'),
        };

        const cacheImages = imageAssets.map(image => {
          return Asset.fromModule(image).downloadAsync();
        });

        const cacheFonts = Font.loadAsync(fontAssets);

        await Promise.all([...cacheImages, cacheFonts]);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) return null;

  const nextStep = (currentStep: OnboardingStep, next: OnboardingStep, answer?: any) => {
    if (answer !== undefined) {
      setOnboarding(prev => {
        const newData = { ...prev };
        if (currentStep === 'q1') newData.nihilistReason = answer;
        if (currentStep === 'q2') {
          newData.transformationType = answer;
          const selected = Q2_OPTIONS.find(o => o.id === answer);
          if (selected) {
            newData.day1Habits = [...prev.day1Habits, { id: 'suggested', title: selected.suggestion, emoji: '✨' }];
          }
        }
        if (currentStep === 'q3') {
          // Toggle functionality for multiple focus
          const exists = prev.habitFocus.includes(answer);
          newData.habitFocus = exists
            ? prev.habitFocus.filter(a => a !== answer)
            : [...prev.habitFocus, answer];
        }
        if (currentStep === 'q4') newData.timeline = answer;
        if (currentStep === 'q5') newData.reminderTime = answer;

        return newData;
      });
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(next);
  };

  const toggleHabit = (id: string) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    setOnboarding(prev => {
      const currentHistory = prev.habitHistory[dateKey] || [];
      const isCompleted = currentHistory.includes(id);

      let newHistory;
      if (isCompleted) {
        newHistory = currentHistory.filter(hId => hId !== id);
      } else {
        newHistory = [...currentHistory, id];
      }

      return {
        ...prev,
        habitHistory: {
          ...prev.habitHistory,
          [dateKey]: newHistory
        }
      };
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const renderIntro1 = () => (
    <CinematicIntro
      imageSource={require('./assets/nihilist_penguin.png')}
      tag="PART I"
      title={"THE NIHILIST\nPENGUIN"}
      caption={'"You\'re walking away from everything.\nNo direction. No meaning. No why."'}
      buttonText="CONTINUE WALK"
      buttonIcon="arrow-right"
      onPress={() => setStep('intro2')}
    />
  );

  const renderIntro2 = () => (
    <CinematicIntro
      imageSource={require('./assets/opium_bird.png')}
      tag="PART II"
      title={"THE\nAWAKENING"}
      caption={'"In 55 days, you become something different.\nThe Opium Bird. Enlightened. Transformed."'}
      buttonText="I HAVE a REASON"
      buttonIcon="zap"
      onPress={() => setStep('welcome')}
    />
  );

  const renderWelcome = () => (
    <CinematicIntro
      imageSource={require('./assets/welcome_visual.png')}
      tag="READY?"
      title={"YOUR\nTRANSFORMATION"}
      caption={'"Build Life-Changing Habits.\nJoin 100,000+ people improving daily."'}
      buttonText="GET STARTED"
      buttonIcon="arrow-right"
      onPress={() => nextStep('welcome', 'q1')}
    />
  );

  const renderDashboard = () => (
    <View style={[styles.screen, { backgroundColor: '#000' }]}>
      <Image
        source={require('./assets/pattern_bg.png')}
        style={[StyleSheet.absoluteFill, { opacity: 0.1 }]}
        resizeMode="repeat"
      />
      <LinearGradient
        colors={['rgba(43, 144, 143, 0.1)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: 60 }]}>
        <Text style={[styles.cinematicTag, { marginBottom: 4 }]}>EVOLUTION TRACKER</Text>
        <Text style={[styles.dashboardTitle, { color: '#fff' }]}>Day 1 of {onboarding.timeline}</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Calendar Section (Sliding Window) */}
        <FadeInView delay={200} style={{ marginBottom: 30 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', paddingVertical: 15, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 15 }}
              contentOffset={{ x: (15 * 52) - (width / 2) + 26 + 15, y: 0 }}
            >
              {Array.from({ length: 31 }).map((_, i) => {
                // Centered on Today
                const d = new Date();
                d.setDate(d.getDate() - 15 + i);

                const isSelected = d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
                const isToday = d.getDate() === new Date().getDate() && d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();

                return (
                  <Pressable
                    key={i}
                    style={{ alignItems: 'center', marginRight: 12, width: 40, opacity: 1 }}
                    onPress={() => {
                      setSelectedDate(new Date(d));
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text style={{
                      fontFamily: 'Garet-Book',
                      color: isSelected ? PRIMARY_COLOR : 'rgba(255,255,255,0.4)',
                      fontSize: 11,
                      marginBottom: 8
                    }}>
                      {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </Text>
                    <View style={{
                      width: 40, height: 40, borderRadius: 20,
                      backgroundColor: isSelected ? PRIMARY_COLOR : 'rgba(255,255,255,0.05)',
                      justifyContent: 'center', alignItems: 'center',
                      borderWidth: isSelected ? 0 : 1,
                      borderColor: isSelected ? PRIMARY_COLOR : (isToday ? '#fff' : 'rgba(255,255,255,0.1)'),
                      shadowColor: isSelected ? PRIMARY_COLOR : '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isSelected ? 0.3 : 0,
                      shadowRadius: 8,
                      elevation: isSelected ? 5 : 0
                    }}>
                      <Text style={{
                        fontFamily: 'Garet-Heavy',
                        color: isSelected ? '#000' : '#fff',
                        fontSize: 14
                      }}>
                        {d.getDate()}
                      </Text>
                    </View>
                    {isToday && !isSelected && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff', marginTop: 6 }} />}
                    {isSelected && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: PRIMARY_COLOR, marginTop: 6 }} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </FadeInView>

        {/* Habit List Section */}
        <FadeInView delay={400} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Mantras</Text>
        </FadeInView>

        <View style={styles.habitGrid}>
          {onboarding.day1Habits.map((habit, index) => {
            const dateKey = selectedDate.toISOString().split('T')[0];
            const isCompleted = (onboarding.habitHistory[dateKey] || []).includes(habit.id);

            return (
              <FadeInView key={habit.id} delay={600 + index * 100}>
                <Pressable
                  style={[
                    styles.habitGlassCard,
                    isCompleted && { borderColor: 'rgba(43, 144, 143, 0.3)', backgroundColor: 'rgba(43, 144, 143, 0.05)' }
                  ]}
                  onPress={() => toggleHabit(habit.id)}
                >
                  <View style={[styles.habitIconContainer, isCompleted && { backgroundColor: 'rgba(43, 144, 143, 0.2)' }]}>
                    <Text style={[styles.habitIconEmoji, isCompleted && { opacity: 0.5 }]}>{habit.emoji}</Text>
                  </View>
                  <View style={styles.habitCardInfo}>
                    <Text style={[styles.habitCardTitle, isCompleted && { color: 'rgba(255,255,255,0.3)', textDecorationLine: 'line-through' }]}>
                      {habit.title}
                    </Text>
                    <Text style={[styles.habitCardStatus, isCompleted && { color: PRIMARY_COLOR }]}>
                      {isCompleted ? 'Mastered today' : 'Daily Commitment'}
                    </Text>
                  </View>
                  <View style={[
                    styles.habitCheckCircle,
                    isCompleted && { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }
                  ]}>
                    <Feather name="check" size={16} color={isCompleted ? "#fff" : "rgba(255,255,255,0.1)"} />
                  </View>
                </Pressable>
              </FadeInView>
            );
          })}
        </View>

        <FadeInView delay={1000} style={styles.quoteSeparator} />

        <FadeInView delay={1200} style={styles.zenQuoteContainer}>
          <Feather name="anchor" size={20} color={PRIMARY_COLOR} style={{ marginBottom: 16 }} />
          <Text style={styles.zenQuoteText}>
            "The mountains aren't torture.{"\n"}They're just {onboarding.timeline} days away."
          </Text>
        </FadeInView>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.navbar, { borderTopColor: 'rgba(255,255,255,0.08)', height: Platform.OS === 'ios' ? 90 : 70, paddingVertical: 0 }]}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable
          style={styles.navButton}
          onPress={() => setStep('dashboard')}
        >
          <Feather name="home" size={28} color={step === 'dashboard' ? PRIMARY_COLOR : "rgba(255,255,255,0.3)"} />
        </Pressable>
        <Pressable
          style={styles.navPlusButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Feather name="plus" size={36} color="#000" />
        </Pressable>
        <Pressable
          style={styles.navButton}
          onPress={() => setStep('stats')}
        >
          <Feather name="bar-chart-2" size={28} color={step === 'stats' ? PRIMARY_COLOR : "rgba(255,255,255,0.3)"} />
        </Pressable>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={[styles.screen, { backgroundColor: '#000' }]}>
      <Image
        source={require('./assets/pattern_bg.png')}
        style={[StyleSheet.absoluteFill, { opacity: 0.1 }]}
        resizeMode="repeat"
      />

      <View style={[styles.header, { paddingTop: 60 }]}>
        <Text style={[styles.cinematicTag, { marginBottom: 4 }]}>ANALYTICS</Text>
        <Text style={[styles.dashboardTitle, { color: '#fff' }]}>Transcendence</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Main Goal Card - Moved from Dashboard */}
        <FadeInView delay={100} style={{ marginBottom: 30 }}>
          <View style={styles.premiumMainCard}>
            <View style={styles.premiumMainBadge}>
              <Text style={styles.premiumMainBadgeText}>CURRENT PHASE</Text>
            </View>
            <Text style={styles.premiumMainTitle}>Nihilist → Opium Bird</Text>
            <View style={styles.premiumProgressContainer}>
              <View style={[styles.premiumProgressBar, { width: '15%' }]} />
            </View>
            <Text style={styles.premiumProgressText}>15% Transcendence Complete</Text>
          </View>
        </FadeInView>

        {/* Momentum Chart Section */}
        <FadeInView delay={200} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly Momentum</Text>
        </FadeInView>

        <FadeInView delay={400} style={[styles.statGlassCard, { height: 180, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 30 }]}>
          {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
            <View key={i} style={{ alignItems: 'center' }}>
              <View style={{ width: 12, height: h, backgroundColor: i === 6 ? PRIMARY_COLOR : 'rgba(255,255,255,0.1)', borderRadius: 6 }} />
              <Text style={[styles.statLabel, { fontSize: 10, marginTop: 8 }]}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
            </View>
          ))}
        </FadeInView>

        {/* Quick Stats Section - Moved from Dashboard */}
        <View style={[styles.statsRow, { marginTop: 30 }]}>
          <FadeInView delay={600} style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1 }]}>
            <Text style={styles.statValue}>1</Text>
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.6)' }]}>Day Streak</Text>
          </FadeInView>
          <FadeInView delay={800} style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1 }]}>
            <Text style={styles.statValue}>{onboarding.timeline}</Text>
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.6)' }]}>Days to Bird</Text>
          </FadeInView>
        </View>

        {/* Visual Journey Tracker */}
        <FadeInView delay={1000} style={[styles.journeyCard, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, marginTop: 30 }]}>
          <Text style={styles.journeyTitle}>YOUR EVOLUTION</Text>
          <View style={styles.journeyContainer}>
            <View style={[styles.journeyLine, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
            <View style={styles.journeyStep}>
              <View style={styles.journeyIconWrapper}>
                <View style={[styles.iconCropContainer, styles.activeStepGlow, { width: 56, height: 56, borderRadius: 28 }]}>
                  <ExpoImage
                    source={require('./assets/evolution-img-1.png')}
                    style={styles.evolutionIconFixed}
                    contentFit="cover"
                    transition={0}
                    priority="high"
                  />
                </View>
              </View>
              <Text style={[styles.journeyStepLabelHeader, { color: PRIMARY_COLOR }]}>Day 1</Text>
              <View style={styles.journeyStageWrapper}>
                <Text style={styles.journeyStepLabelSub}>Nihilist</Text>
              </View>
            </View>

            <View style={styles.journeyStep}>
              <View style={styles.journeyIconWrapper}>
                <View style={[styles.iconCropContainer, { backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }]}>
                  <ExpoImage source={require('./assets/evolution-img-2.png')} style={styles.evolutionIcon} contentFit="cover" />
                </View>
              </View>
              <Text style={[styles.journeyStepLabelHeader, { color: 'rgba(255,255,255,0.4)' }]}>Day 15</Text>
              <View style={styles.journeyStageWrapper} />
            </View>

            <View style={styles.journeyStep}>
              <View style={styles.journeyIconWrapper}>
                <View style={[styles.iconCropContainer, { backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }]}>
                  <ExpoImage source={require('./assets/evolution-img-3.png')} style={styles.evolutionIcon} contentFit="cover" />
                </View>
              </View>
              <Text style={[styles.journeyStepLabelHeader, { color: 'rgba(255,255,255,0.4)' }]}>Day 30</Text>
              <View style={styles.journeyStageWrapper} />
            </View>

            <View style={styles.journeyStep}>
              <View style={styles.journeyIconWrapper}>
                <View style={[styles.iconCropContainer, { backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }]}>
                  <ExpoImage source={require('./assets/evolution-img-4.png')} style={styles.evolutionIcon} contentFit="cover" />
                </View>
              </View>
              <Text style={[styles.journeyStepLabelHeader, { color: 'rgba(255,255,255,0.4)' }]}>Day {onboarding.timeline}</Text>
              <View style={styles.journeyStageWrapper} />
            </View>
          </View>
        </FadeInView>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.navbar, { borderTopColor: 'rgba(255,255,255,0.08)', height: Platform.OS === 'ios' ? 90 : 70, paddingVertical: 0 }]}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable
          style={styles.navButton}
          onPress={() => setStep('dashboard')}
        >
          <Feather name="home" size={28} color={step === 'dashboard' ? PRIMARY_COLOR : "rgba(255,255,255,0.3)"} />
        </Pressable>
        <Pressable
          style={styles.navPlusButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Feather name="plus" size={36} color="#000" />
        </Pressable>
        <Pressable
          style={styles.navButton}
          onPress={() => setStep('stats')}
        >
          <Feather name="bar-chart-2" size={28} color={step === 'stats' ? PRIMARY_COLOR : "rgba(255,255,255,0.3)"} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style={['intro1', 'intro2', 'success', 'dashboard', 'stats', 'welcome'].includes(step) ? 'light' : 'dark'} />



      {step === 'intro1' && renderIntro1()}
      {step === 'intro2' && renderIntro2()}
      {step === 'welcome' && renderWelcome()}
      {step === 'q1' && (
        <QuestionScreen
          title={"Why are you\nhere?"}
          options={Q1_OPTIONS}
          currentStep="q1"
          next="q2"
          progress={0.2}
          onNext={nextStep}
        />
      )}
      {step === 'q2' && (
        <QuestionScreen
          title={"Choose your\nfocus area"}
          options={Q2_OPTIONS}
          currentStep="q2"
          next="q3"
          progress={0.4}
          onNext={nextStep}
        />
      )}
      {step === 'q3' && (
        <QuestionScreen
          title={"What is your\nbiggest challenge?"}
          options={Q3_OPTIONS}
          currentStep="q3"
          next="q4"
          progress={0.6}
          onNext={nextStep}
        />
      )}
      {step === 'q4' && (
        <QuestionScreen
          title={"How many habits\nto track?"}
          options={Q4_OPTIONS}
          currentStep="q4"
          next="q5"
          progress={0.6}
          onNext={nextStep}
        />
      )}
      {step === 'q5' && (
        <QuestionScreen
          title={"When do you\nusually fail?"}
          options={Q5_OPTIONS}
          currentStep="q5"
          next="q6"
          progress={0.7}
          onNext={nextStep}
        />
      )}
      {step === 'q6' && (
        <QuestionScreen
          title={"How much time\ncan you dedicate?"}
          options={Q6_OPTIONS}
          currentStep="q6"
          next="reminder"
          progress={0.8}
          onNext={nextStep}
        />
      )}
      {step === 'reminder' && (
        <NotificationScreen
          progress={0.9}
          notificationTime={notificationTime}
          showTimePicker={showTimePicker}
          onTimePress={() => setShowTimePicker(true)}
          onTimeChange={(event: any, selectedDate: any) => {
            if (Platform.OS === 'android') setShowTimePicker(false);
            if (selectedDate) setNotificationTime(selectedDate);
          }}
          onConfirm={async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Notifications', 'Please enable notifications to stay on track!');
            }
            const timeStr = notificationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            nextStep('reminder', 'loading', timeStr);
            setTimeout(() => setStep('firstHabit'), 2500);
          }}
        />
      )}
      {step === 'loading' && <LoadingScreen transformationType={onboarding.transformationType} />}
      {step === 'firstHabit' && <FirstHabitScreen onboarding={onboarding} onActivate={() => setStep('success')} />}
      {step === 'success' && <SuccessScreen onDashboard={() => setStep('paywall')} />}
      {step === 'paywall' && (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {renderDashboard()}
          <PaywallScreen visible={true} onContinue={() => setStep('dashboard')} />
        </View>
      )}
      {step === 'dashboard' && renderDashboard()}
      {step === 'stats' && renderStats()}

      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={consolidatedClose}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(0,0,0,0.85)', opacity: overlayOpacity }
            ]}
          />
          <Pressable style={StyleSheet.absoluteFill} onPress={consolidatedClose} />

          <Animated.View
            style={[
              styles.iosSheetCard,
              {
                transform: [{ translateY: panY }],
                backgroundColor: '#0A0A0A',
                borderWidth: 0,
                borderTopLeftRadius: 36,
                borderTopRightRadius: 36,
                paddingTop: 12
              }
            ]}
            {...panResponder.panHandlers}
          >
            <KeyboardAvoidingView
              behavior="padding"
              style={{ flex: 1 }}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 20}
            >


              {/* Premium Grabber */}
              <View style={{ alignSelf: 'center', width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, marginBottom: 20 }} />

              <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 20, paddingBottom: 20 }}
                style={{ flex: 1 }}
              >
                {/* Header Section */}
                <View style={{ alignItems: 'center', marginBottom: 25 }}>
                  <Text style={{
                    color: PRIMARY_COLOR, fontSize: 10, fontFamily: 'Garet-Heavy',
                    letterSpacing: 2, marginBottom: 8, opacity: 0.8
                  }}>
                    NEW HABIT
                  </Text>
                  <Text style={{
                    color: '#fff', fontSize: 24, fontFamily: 'Garet-Heavy',
                    textAlign: 'center'
                  }}>
                    What is your next{'\n'}transformation?
                  </Text>
                </View>

                {/* Visual Preview Area - Removed Circle */}
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 40 }}>{getAutoEmoji(newHabitTitle) || '⚡'}</Text>
                </View>

                {/* Input Field */}
                <View style={{ marginBottom: 40 }}>
                  <TextInput
                    style={{
                      fontSize: 16,
                      fontFamily: 'Garet-Heavy',
                      color: '#fff',
                      textAlign: 'center',
                      paddingVertical: 15,
                    }}
                    placeholder="ENTER HABIT..."
                    placeholderTextColor="rgba(255,255,255,0.08)"
                    value={newHabitTitle}
                    onChangeText={setNewHabitTitle}
                    autoFocus={false}
                    selectionColor={PRIMARY_COLOR}
                    autoCapitalize="words"
                  />
                  <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', width: '60%', alignSelf: 'center' }} />
                </View>
              </ScrollView>

              {/* Action Button - Pinned to bottom, moves with keyboard */}
              <View style={{ paddingHorizontal: 28, paddingBottom: Platform.OS === 'ios' ? 40 : 24, gap: 12 }}>
                <Pressable
                  onPress={() => {
                    if (newHabitTitle.trim()) {
                      const icon = getAutoEmoji(newHabitTitle);
                      setOnboarding(prev => ({
                        ...prev,
                        day1Habits: [
                          ...prev.day1Habits,
                          { id: Date.now().toString(), title: newHabitTitle, emoji: icon }
                        ]
                      }));
                      setNewHabitTitle('');
                      consolidatedClose();
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                  }}
                >
                  <LinearGradient
                    colors={newHabitTitle.trim() ? [PRIMARY_COLOR, '#1e6b6a'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)']}
                    style={{
                      height: 58, borderRadius: 20,
                      justifyContent: 'center', alignItems: 'center',
                      shadowColor: newHabitTitle.trim() ? PRIMARY_COLOR : 'transparent',
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.3, shadowRadius: 20
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={{
                      color: newHabitTitle.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
                      fontSize: 16, fontFamily: 'Garet-Heavy', letterSpacing: 1
                    }}>
                      ADD HABIT
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screen: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  welcomeImage: {
    width: width,
    height: height * 0.6,
  },
  welcomeContent: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  welcomeTitle: {
    fontSize: 42,
    fontFamily: 'Garet-Heavy',
    color: '#000',
    lineHeight: 48,
  },
  welcomeSubtitle: {
    fontSize: 18,
    fontFamily: 'Garet-Book',
    color: '#666',
    marginTop: 16,
    marginBottom: 40,
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    width: 60,
    marginBottom: 30,
  },
  progressBar: {
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 3,
  },
  questionTitle: {
    fontSize: 32,
    fontFamily: 'Garet-Heavy',
    lineHeight: 38,
    marginBottom: 12,
    color: '#fff',
  },
  questionSubtitle: {
    fontSize: 16,
    fontFamily: 'Garet-Book',
    lineHeight: 24,
    color: 'rgba(255,255,255,0.6)',
  },
  optionsContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
    letterSpacing: 0.2,
  },
  timePickerContainer: {
    padding: 30,
    flex: 1,
    justifyContent: 'center',
  },
  timeDisplay: {
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  timeText: {
    fontSize: 48,
    fontFamily: 'Garet-Heavy',
    color: PRIMARY_COLOR,
  },
  footer: {
    padding: 30,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Garet-Heavy',
  },
  loadingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: PRIMARY_COLOR,
    borderTopColor: 'transparent',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  tag: {
    backgroundColor: PRIMARY_COLOR + '20',
    color: PRIMARY_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 12,
    fontFamily: 'Garet-Heavy',
    marginBottom: 12,
    overflow: 'hidden',
  },
  suggestionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
  },
  suggestionEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  suggestionText: {
    fontSize: 28,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
    textAlign: 'center',
  },
  suggestionSub: {
    fontSize: 16,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 12,
  },
  dashboardTitle: {
    fontSize: 28,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
  },
  dashboardSubtitle: {
    fontSize: 16,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.6)',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
  },
  habitIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitTitle: {
    fontSize: 18,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
  },
  habitTime: {
    fontSize: 14,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 24,
    marginRight: 10,
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  navButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  introContainer: {
    paddingTop: 80,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  introContentLayout: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingTop: 60,
    paddingBottom: 25,
  },
  introHeaderSection: {
    alignItems: 'flex-start',
    zIndex: 2,
    marginTop: 20,
  },
  introFooterSection: {
    alignItems: 'flex-start',
    zIndex: 2,
    marginBottom: 10,
  },
  cinematicBgContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  introImageEpic: {
    width: width,
    height: height * 1.1,
    top: 40,
    opacity: 0.85,
  },
  cinematicTag: {
    color: PRIMARY_COLOR,
    fontFamily: 'Garet-Heavy',
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 8,
  },
  cinematicTitle: {
    color: '#fff',
    fontFamily: 'Garet-Heavy',
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -1,
  },
  cinematicCaption: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Garet-Book',
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic',
    marginBottom: 40,
  },
  dividerSmall: {
    width: 40,
    height: 2,
    backgroundColor: PRIMARY_COLOR,
    marginTop: 20,
    marginBottom: 20,
  },
  premiumButton: {
    backgroundColor: '#fff',
    height: 58,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 35,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonCenterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navPlusButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -65, // Raised even higher as requested
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    zIndex: 100, // Make sure it stays above everything
  },
  premiumButtonText: {
    color: '#000',
    fontFamily: 'Garet-Heavy',
    fontSize: 14,
    letterSpacing: 1,
  },
  introTag: {
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 10,
    fontFamily: 'Garet-Heavy',
    marginBottom: 16,
    overflow: 'hidden',
    letterSpacing: 2,
  },
  introTitle: {
    fontSize: 32,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 38,
  },
  introImage: {
    flex: 1,
    width: width,
    height: width,
  },
  introFooter: {
    padding: 30,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
  },
  introCaption: {
    fontSize: 18,
    fontFamily: 'Garet-Book',
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  premiumMainCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 32,
    padding: 30,
    marginBottom: 35,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  premiumMainBadge: {
    alignSelf: 'flex-start',
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  premiumMainBadgeText: {
    color: '#000',
    fontSize: 10,
    fontFamily: 'Garet-Heavy',
    letterSpacing: 1,
  },
  premiumMainTitle: {
    fontSize: 24,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
    marginBottom: 24,
  },
  premiumProgressContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 12,
  },
  premiumProgressBar: {
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 2,
  },
  premiumProgressText: {
    fontSize: 12,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.5)',
  },
  paywallFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 18,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  paywallFeatureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(43, 144, 143, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paywallFeatureTitle: {
    fontSize: 16,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
    marginBottom: 2,
  },
  paywallFeatureSub: {
    fontSize: 12,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.5)',
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  planCardActive: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: 'rgba(43, 144, 143, 0.05)',
  },
  planTitle: {
    fontSize: 16,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
    marginBottom: 4,
  },
  planSubtitle: {
    fontSize: 13,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.4)',
  },
  planBadge: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  planBadgeText: {
    fontSize: 10,
    fontFamily: 'Garet-Heavy',
    color: '#000',
  },
  planCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCheckActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  paywallFooter: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  paywallFooterText: {
    fontSize: 11,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
  catalystBadge: {
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  catalystBadgeText: {
    color: PRIMARY_COLOR,
    fontFamily: 'Garet-Heavy',
    fontSize: 10,
    letterSpacing: 2,
  },
  catalystMainCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 36,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  catalystIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(43, 144, 143, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  catalystIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(43, 144, 143, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catalystHabitTitle: {
    fontSize: 24,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
    marginBottom: 12,
  },
  catalystDivider: {
    width: 40,
    height: 2,
    backgroundColor: PRIMARY_COLOR,
    marginBottom: 20,
  },
  catalystDescription: {
    fontSize: 15,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  activationHint: {
    fontSize: 12,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.3)',
    marginTop: 16,
  },
  imageOverlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
  },
  habitGrid: {
    gap: 16,
    marginBottom: 30,
  },
  habitGlassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  habitIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  habitIconEmoji: {
    fontSize: 20,
  },
  habitCardInfo: {
    flex: 1,
  },
  habitCardTitle: {
    fontSize: 16,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
    marginBottom: 2,
  },
  habitCardStatus: {
    fontSize: 11,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.4)',
  },
  habitCheckCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zenQuoteContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 40,
  },
  zenQuoteText: {
    fontSize: 16,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  quoteSeparator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
  },
  statGlassCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    fontSize: 32,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  modalInputGlow: {
    height: 1,
    width: '80%',
    backgroundColor: PRIMARY_COLOR,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  iosSheetCard: {
    height: height * 0.92,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iosGrabber: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalBodyContent: {
    flex: 1,
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
  },
  modalSheetTitle: {
    fontSize: 28,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  modalInputWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  modalSheetInput: {
    fontSize: 24,
    fontFamily: 'Garet-Book',
    color: '#fff',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 15,
  },
  journeyCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginTop: 30,
  },
  journeyTitle: {
    fontSize: 12,
    fontFamily: 'Garet-Heavy',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },
  journeyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    height: 120,
    marginTop: 15,
  },
  journeyLine: {
    position: 'absolute',
    top: 30,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  journeyStep: {
    alignItems: 'center',
    width: 60,
    zIndex: 1,
  },
  journeyIconWrapper: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCropContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepGlow: {
    backgroundColor: 'rgba(43, 144, 143, 0.2)',
    borderColor: PRIMARY_COLOR,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  evolutionIconFixed: {
    width: '100%',
    height: '100%',
  },
  evolutionIcon: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.05 }],
  },
  journeyStepLabelHeader: {
    fontSize: 10,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
  },
  journeyStageWrapper: {
    height: 15,
    marginTop: 4,
    justifyContent: 'center',
  },
  journeyStepLabelSub: {
    fontSize: 9,
    fontFamily: 'Garet-Book',
    marginTop: 2,
    color: PRIMARY_COLOR,
  },
  paywallSheet: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  paywallPremiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  paywallIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  paywallRowTitle: {
    fontSize: 16,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
    marginBottom: 4,
  },
  paywallRowSub: {
    fontSize: 12,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.6)',
  },
  planCardPremium: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  planCardPremiumActive: {
    backgroundColor: 'rgba(43, 144, 143, 0.08)',
    borderColor: PRIMARY_COLOR,
  },
  planTitlePremium: {
    fontSize: 16,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
  },
  planBadgePremium: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planBadgeTextPremium: {
    fontSize: 10,
    fontFamily: 'Garet-Heavy',
    color: '#000',
    letterSpacing: 0.5,
  },
  planPricePremium: {
    fontSize: 24,
    fontFamily: 'Garet-Heavy',
    color: PRIMARY_COLOR,
    marginVertical: 4,
  },
  planSubPremium: {
    fontSize: 13,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.5)',
  },
  premiumButtonLarge: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  premiumButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 35,
  },
  premiumButtonTextLarge: {
    fontSize: 16,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
    letterSpacing: 2,
    marginRight: 10,
  },
  restoreLink: {
    fontSize: 14,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.4)',
    textDecorationLine: 'underline',
  },
  compactFeatureBox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  compactFeatureText: {
    fontSize: 11,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 14,
  },
  legalTextMini: {
    fontSize: 10,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.3)',
  },
  planCardCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  planTitleSmall: {
    fontSize: 15,
    fontFamily: 'Garet-Heavy',
    color: '#fff',
  },
  planSubtitleSmall: {
    fontSize: 12,
    fontFamily: 'Garet-Book',
    color: 'rgba(255,255,255,0.4)',
  },
  planBadgeSmall: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 10,
  },
  planBadgeTextSmall: {
    fontSize: 10,
    fontFamily: 'Garet-Heavy',
    color: '#000',
  },
  planCheckSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexDir: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
