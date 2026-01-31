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
import { Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const GOLD = '#D4AF37';

interface PaywallProps {
    visible: boolean;
    onContinue: () => void;
    onClose?: () => void;
}

export const Paywall2 = ({ visible, onContinue, onClose }: PaywallProps) => {
    const [selectedPlan, setSelectedPlan] = useState('annual');
    const [fadeAnim] = useState(new Animated.Value(0));

    const PLANS = [
        { id: 'monthly', title: 'Monthly', price: '$12.99', desc: 'Full access, cancel anytime' },
        { id: 'annual', title: 'Annual', price: '$4.99', desc: 'Billed annually ($59.99)', badge: 'BEST VALUE' },
        { id: 'weekly', title: 'Weekly', price: '$3.99', desc: 'Weekly commitment' },
    ];

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.container}>
                <Image
                    source={require('../assets/evolution-img-2.png')}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                />
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)', '#000']}
                    style={StyleSheet.absoluteFill}
                />
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    <View style={styles.header}>
                        <Pressable onPress={onClose || onContinue} style={styles.closeBtn}>
                            <Feather name="x" size={20} color="#fff" />
                        </Pressable>
                        <Text style={styles.premiumLabel}>THE ELITE CLUB</Text>
                        <Text style={styles.mainTitle}>Master Your Destiny</Text>
                        <View style={styles.separator} />
                    </View>

                    <View style={styles.scroll}>
                        <View style={styles.featureGrid}>
                            {[
                                { icon: 'star', t: 'Exclusive Content' },
                                { icon: 'zap', t: 'Priority Support' },
                                { icon: 'shield', t: 'Privacy Pro' },
                                { icon: 'cpu', t: 'AI Coaching' }
                            ].map((item, idx) => (
                                <View key={idx} style={styles.featureItem}>
                                    <View style={styles.iconCircle}>
                                        <Feather name={item.icon as any} size={16} color={GOLD} />
                                    </View>
                                    <Text style={styles.featureText}>{item.t}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.plansContainer}>
                            {PLANS.map(plan => (
                                <Pressable
                                    key={plan.id}
                                    onPress={() => setSelectedPlan(plan.id)}
                                    style={[
                                        styles.planCard,
                                        selectedPlan === plan.id && styles.planCardActive
                                    ]}
                                >
                                    <View style={styles.planRow}>
                                        <View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.planTitleText}>{plan.title}</Text>
                                                {plan.badge && (
                                                    <View style={styles.planBadge}>
                                                        <Text style={styles.planBadgeText}>{plan.badge}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.planDescText}>{plan.desc}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={styles.planPriceText}>{plan.price}</Text>
                                            <Text style={styles.planSubText}>/mo</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            ))}
                        </View>

                        <Pressable style={styles.mainBtn} onPress={onContinue}>
                            <Text style={styles.mainBtnText}>UPGRADE TO ELITE</Text>
                        </Pressable>

                        <View style={styles.footerLinks}>
                            <Text style={styles.footerLinkText}>Restore Purchase</Text>
                            <Text style={styles.footerDot}>•</Text>
                            <Text style={styles.footerLinkText}>Privacy Policy</Text>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        padding: 20
    },
    content: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    closeBtn: {
        position: 'absolute',
        top: -20,
        right: 0,
        padding: 10,
    },
    premiumLabel: {
        color: GOLD,
        fontSize: 12,
        fontFamily: 'Garet-Heavy',
        letterSpacing: 4,
        marginBottom: 10,
    },
    mainTitle: {
        color: '#fff',
        fontSize: 34,
        fontFamily: 'Garet-Heavy',
        textAlign: 'center',
    },
    separator: {
        width: 60,
        height: 1,
        backgroundColor: GOLD,
        marginTop: 20,
    },
    scroll: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 20,
    },
    featureGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    featureItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#111',
        padding: 12,
        borderRadius: 8,
    },
    iconCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    featureText: {
        color: '#ccc',
        fontSize: 12,
        fontFamily: 'Garet-Book',
    },
    plansContainer: {
        gap: 12,
        marginBottom: 30,
    },
    planCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#222',
    },
    planCardActive: {
        borderColor: GOLD,
        backgroundColor: '#141414',
    },
    planRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    planTitleText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Garet-Heavy',
    },
    planBadge: {
        backgroundColor: GOLD,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    planBadgeText: {
        color: '#000',
        fontSize: 9,
        fontFamily: 'Garet-Heavy',
    },
    planDescText: {
        color: '#666',
        fontSize: 12,
        fontFamily: 'Garet-Book',
        marginTop: 4,
    },
    planPriceText: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Garet-Heavy',
    },
    planSubText: {
        color: '#666',
        fontSize: 10,
        fontFamily: 'Garet-Book',
    },
    mainBtn: {
        backgroundColor: GOLD,
        height: 56,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    mainBtnText: {
        color: '#000',
        fontSize: 16,
        fontFamily: 'Garet-Heavy',
        letterSpacing: 2,
    },
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        opacity: 0.5,
    },
    footerLinkText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Garet-Book',
    },
    footerDot: {
        color: GOLD,
        fontSize: 12,
    }
});
