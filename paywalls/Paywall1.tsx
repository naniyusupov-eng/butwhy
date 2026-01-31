import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    Platform,
    Modal
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const PRIMARY_COLOR = '#2b908f';

interface PaywallProps {
    visible: boolean;
    onContinue: () => void;
    onClose?: () => void;
}

export const Paywall1 = ({ visible, onContinue, onClose }: PaywallProps) => {
    const [selectedPlan, setSelectedPlan] = useState('yearly');
    const [modalY] = useState(new Animated.Value(height));

    const PLANS = [
        { id: 'weekly', title: 'Weekly Sprint', sub: '$4.99 / Week', mainPrice: '3 DAYS FREE', footer: 'Try Risk Free', badge: null },
        { id: 'monthly', title: 'Monthly Habit', sub: '$9.99 / Month', mainPrice: '3 DAYS FREE', footer: 'Cancel Anytime', badge: null },
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
        } else {
            Animated.timing(modalY, {
                toValue: height,
                duration: 300,
                useNativeDriver: true
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={styles.modalOverlay}>
                <Animated.View style={[styles.paywallSheet, { transform: [{ translateY: modalY }] }]}>
                    <Image
                        source={require('../assets/evolution-img-1.png')}
                        style={[StyleSheet.absoluteFill, { opacity: 0.4 }]}
                        resizeMode="cover"
                    />
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)', '#000']}
                        style={StyleSheet.absoluteFill}
                    />

                    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 45 : 20 }}>
                        <Pressable
                            onPress={onClose || onContinue}
                            style={styles.closeButton}
                        >
                            <Feather name="x" size={24} color="rgba(255,255,255,0.4)" />
                        </Pressable>

                        <View style={{ flex: 1, justifyContent: 'space-between', paddingBottom: 10 }}>
                            <View style={{ alignItems: 'center', marginTop: 50, marginBottom: 20 }}>
                                <Text style={styles.headerTitle}>Unlimited{"\n"}Access</Text>
                            </View>

                            <View style={styles.featuresContainer}>
                                {FEATURES.map((f, i) => (
                                    <View key={i} style={styles.featureRow}>
                                        <Feather name={f.icon as any} size={16} color={PRIMARY_COLOR} style={{ marginRight: 12 }} />
                                        <Text style={styles.featureText}>{f.text}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={{ gap: 6 }}>
                                {PLANS.map((plan) => (
                                    <Pressable
                                        key={plan.id}
                                        style={[
                                            styles.planCard,
                                            selectedPlan === plan.id && styles.planCardActive
                                        ]}
                                        onPress={() => setSelectedPlan(plan.id)}
                                    >
                                        {plan.badge && (
                                            <View style={[styles.badge, plan.badge === 'LEGACY' && { backgroundColor: '#ff4b5c' }]}>
                                                <Text style={styles.badgeText}>{plan.badge}</Text>
                                            </View>
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.planTitle}>{plan.title}</Text>
                                            <Text style={styles.planSub}>{plan.sub}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={[
                                                styles.planPrice,
                                                plan.mainPrice.includes('FREE') && { color: PRIMARY_COLOR }
                                            ]}>
                                                {plan.mainPrice}
                                            </Text>
                                            <Text style={styles.planFooter}>{plan.footer}</Text>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>

                            <View>
                                <Pressable style={[styles.ctaButton, { marginTop: 20 }]} onPress={onContinue}>
                                    <LinearGradient
                                        colors={[PRIMARY_COLOR, '#1e6b6a']}
                                        style={styles.ctaGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.ctaText}>START TRAINING NOW</Text>
                                    </LinearGradient>
                                </Pressable>

                                <View style={styles.legalLinks}>
                                    <Text style={styles.legalText}>Terms</Text>
                                    <Text style={styles.legalText}>Privacy</Text>
                                    <Text style={styles.legalText}>Restore</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    paywallSheet: {
        flex: 1,
        width: '100%',
        backgroundColor: '#000',
        overflow: 'hidden',
    },
    closeButton: {
        position: 'absolute',
        top: 55,
        right: 24,
        zIndex: 100,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 32,
        fontFamily: 'Garet-Heavy',
        textAlign: 'center',
        lineHeight: 38,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        fontFamily: 'Garet-Book',
        marginTop: 8,
    },
    featuresContainer: {
        marginBottom: 20,
        gap: 10,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Garet-Book',
        opacity: 0.8,
    },
    planCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },
    planCardActive: {
        borderColor: PRIMARY_COLOR,
        backgroundColor: 'rgba(43, 144, 143, 0.1)',
        borderWidth: 2,
    },
    badge: {
        position: 'absolute',
        top: -10,
        right: 20,
        backgroundColor: '#ff4b5c',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 8,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'Garet-Heavy',
    },
    planTitle: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Garet-Heavy',
    },
    planSub: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        fontFamily: 'Garet-Book',
    },
    planPrice: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Garet-Heavy',
    },
    planFooter: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontFamily: 'Garet-Book',
    },
    ctaButton: {
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        marginTop: 10,
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
    legalLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 30,
        marginTop: 20,
        opacity: 0.4,
    },
    legalText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Garet-Book',
    },
});
