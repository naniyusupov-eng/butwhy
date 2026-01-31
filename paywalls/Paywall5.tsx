import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    Animated,
    Dimensions,
    Image,
    Modal,
    Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface PaywallProps {
    visible: boolean;
    onContinue: () => void;
    onClose?: () => void;
}

export const Paywall5 = ({ visible, onContinue, onClose }: PaywallProps) => {
    const [zoomAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        if (visible) {
            Animated.timing(zoomAnim, {
                toValue: 1.1,
                duration: 10000,
                useNativeDriver: true
            }).start();
        } else {
            zoomAnim.setValue(1);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={styles.container}>
                <Animated.Image
                    source={require('../assets/evolution-img-4.png')}
                    style={[StyleSheet.absoluteFill, { transform: [{ scale: zoomAnim }] }]}
                    resizeMode="cover"
                />

                <LinearGradient
                    colors={['#1a0b2e', '#2b908f', '#ff3131']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                <View style={styles.content}>
                    <Pressable onPress={onClose || onContinue} style={styles.closeBtn}>
                        <Feather name="chevron-down" size={30} color="#fff" />
                    </Pressable>

                    <View style={styles.topInfo}>
                        <Text style={styles.tag}>LIMITED TIME ACCESS</Text>
                        <Text style={styles.heroTitle}>Your Evolution Begins Today</Text>
                    </View>

                    <View style={styles.bottomSection}>
                        <View style={styles.statRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statVal}>55</Text>
                                <Text style={styles.statLab}>Days</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statVal}>100%</Text>
                                <Text style={styles.statLab}>Commitment</Text>
                            </View>
                        </View>

                        <Text style={styles.description}>
                            Unlock all features including cinematic daily deep dives,
                            unlimited habits, and the complete evolution path.
                        </Text>

                        <Pressable style={styles.bigButton} onPress={onContinue}>
                            <Text style={styles.bigButtonText}>BECOME THE OPIUM BIRD</Text>
                            <Text style={styles.trialInfo}>START 3-DAY FREE TRIAL, THEN $59.99/YR</Text>
                        </Pressable>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Secure with Apple Pay / Google Play</Text>
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
        backgroundColor: '#000808',
    },
    content: {
        flex: 1,
        padding: 30,
        justifyContent: 'space-between',
    },
    closeBtn: {
        alignSelf: 'center',
        marginTop: 20,
        opacity: 0.5,
    },
    topInfo: {
        marginTop: 20,
    },
    tag: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Garet-Heavy',
        letterSpacing: 2,
        marginBottom: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    heroTitle: {
        color: '#fff',
        fontSize: 40,
        fontFamily: 'Garet-Heavy',
        lineHeight: 44,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    bottomSection: {
        marginBottom: 40,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        gap: 20,
    },
    statBox: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 12,
        borderRadius: 12,
        minWidth: 100,
    },
    statVal: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'Garet-Heavy',
    },
    statLab: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontFamily: 'Garet-Book',
    },
    description: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Garet-Book',
        lineHeight: 24,
        marginBottom: 40,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 5,
    },
    bigButton: {
        backgroundColor: '#fff',
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    bigButtonText: {
        color: '#000',
        fontSize: 18,
        fontFamily: 'Garet-Heavy',
    },
    trialInfo: {
        color: '#666',
        fontSize: 10,
        fontFamily: 'Garet-Book',
        marginTop: 5,
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        fontFamily: 'Garet-Book',
    },
});
