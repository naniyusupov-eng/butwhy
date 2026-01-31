import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    Animated,
    Dimensions,
    ScrollView,
    Platform,
    Modal
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface PaywallProps {
    visible: boolean;
    onContinue: () => void;
    onClose?: () => void;
}

export const Paywall3 = ({ visible, onContinue, onClose }: PaywallProps) => {
    const [selectedPlan, setSelectedPlan] = useState('weekly');
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true
                })
            ])
        ).start();
    }, []);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={styles.container}>
                <LinearGradient
                    colors={['#1a0b2e', '#090513']}
                    style={StyleSheet.absoluteFill}
                />

                <View style={styles.content}>
                    <Pressable onPress={onClose || onContinue} style={styles.closeBtn}>
                        <Feather name="x" size={24} color="#fff" />
                    </Pressable>

                    <View style={{ flex: 1, justifyContent: 'space-between', paddingBottom: 20 }}>
                        <View style={styles.header}>
                            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                <LinearGradient
                                    colors={['#ff00cc', '#3333ff']}
                                    style={styles.logoCircle}
                                >
                                    <Feather name="zap" size={30} color="#fff" />
                                </LinearGradient>
                            </Animated.View>
                            <Text style={styles.title}>GO BEYOND</Text>
                            <Text style={styles.subtitle}>Supercharge your daily routine</Text>
                        </View>

                        <View style={styles.featureList}>
                            {[
                                'Unlimited Habit Tracking',
                                'Advanced Data Visualization',
                                'Custom Reminders & Tones',
                                'Export Habits Data',
                                'Ad-Free Experience'
                            ].map((f, i) => (
                                <View key={i} style={styles.featureItem}>
                                    <Feather name="check" size={18} color="#ff00cc" />
                                    <Text style={styles.featureText}>{f}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.plans}>
                            <Pressable
                                onPress={() => setSelectedPlan('weekly')}
                                style={[styles.planCard, selectedPlan === 'weekly' && styles.activePlan]}
                            >
                                <Text style={styles.planName}>Weekly</Text>
                                <Text style={styles.planPrice}>$2.99</Text>
                                <Text style={styles.planInterval}>per week</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => setSelectedPlan('monthly')}
                                style={[styles.planCard, selectedPlan === 'monthly' && styles.activePlan]}
                            >
                                <View style={styles.popularBadge}>
                                    <Text style={styles.popularText}>POPULAR</Text>
                                </View>
                                <Text style={styles.planName}>Monthly</Text>
                                <Text style={styles.planPrice}>$9.99</Text>
                                <Text style={styles.planInterval}>per month</Text>
                            </Pressable>
                        </View>

                        <View>
                            <Pressable style={styles.cta} onPress={onContinue}>
                                <LinearGradient
                                    colors={['#ff00cc', '#3333ff']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.ctaGradient}
                                >
                                    <Text style={styles.ctaText}>START 7-DAY FREE TRIAL</Text>
                                </LinearGradient>
                            </Pressable>

                            <Text style={styles.disclaimer}>
                                Cancel anytime. Subscription automatically renews unless turned off.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        paddingTop: 60,
    },
    closeBtn: {
        position: 'absolute',
        top: 50,
        right: 24,
        zIndex: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#ff00cc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 20,
    },
    title: {
        color: '#fff',
        fontSize: 40,
        fontFamily: 'Garet-Heavy',
        letterSpacing: 2,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        fontFamily: 'Garet-Book',
        marginTop: 5,
    },
    featureList: {
        marginBottom: 40,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    featureText: {
        color: '#fff',
        fontSize: 15,
        marginLeft: 15,
        fontFamily: 'Garet-Book',
    },
    plans: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 30,
    },
    planCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    activePlan: {
        borderColor: '#ff00cc',
        backgroundColor: 'rgba(255,0,204,0.1)',
        borderWidth: 2,
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    popularText: {
        color: '#000',
        fontSize: 9,
        fontFamily: 'Garet-Heavy',
    },
    planName: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Garet-Heavy',
    },
    planPrice: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'Garet-Heavy',
        marginVertical: 5,
    },
    planInterval: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontFamily: 'Garet-Book',
    },
    cta: {
        borderRadius: 30,
        overflow: 'hidden',
        height: 60,
        marginBottom: 20,
    },
    ctaGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Garet-Heavy',
    },
    disclaimer: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        textAlign: 'center',
        fontFamily: 'Garet-Book',
        lineHeight: 18,
    }
});
