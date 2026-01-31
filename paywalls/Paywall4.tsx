import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    Dimensions,
    ScrollView,
    Modal,
    Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface PaywallProps {
    visible: boolean;
    onContinue: () => void;
    onClose?: () => void;
}

export const Paywall4 = ({ visible, onContinue, onClose }: PaywallProps) => {
    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={styles.dragHandle} />

                    <Pressable onPress={onClose || onContinue} style={styles.closeX}>
                        <Feather name="x" size={24} color="#666" />
                    </Pressable>

                    <Text style={styles.h1}>Compare Plans</Text>
                    <Text style={styles.h2}>Identify the right fit for your evolution</Text>

                    <View style={styles.comparisonTable}>
                        <View style={styles.tableHeader}>
                            <View style={styles.colLabel} />
                            <View style={styles.colFree}><Text style={styles.colTitle}>FREE</Text></View>
                            <View style={styles.colPro}><Text style={[styles.colTitle, { color: '#2b908f' }]}>PRO</Text></View>
                        </View>

                        {[
                            { label: 'Daily Habits', free: '3', pro: 'Unlimited' },
                            { label: 'Statistics', free: 'Basic', pro: 'Advanced' },
                            { label: 'Cloud Sync', free: '×', pro: '✓' },
                            { label: 'AI Insights', free: '×', pro: '✓' },
                            { label: 'Custom Themes', free: '×', pro: '✓' },
                            { label: 'Export Data', free: '×', pro: '✓' },
                        ].map((row, i) => (
                            <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.rowAlt]}>
                                <View style={styles.colLabel}><Text style={styles.rowLabel}>{row.label}</Text></View>
                                <View style={styles.colFree}><Text style={styles.rowValue}>{row.free}</Text></View>
                                <View style={styles.colPro}><Text style={[styles.rowValue, row.pro === '✓' && { color: '#2b908f' }]}>{row.pro}</Text></View>
                            </View>
                        ))}

                        <View style={styles.pricingSection}>
                            <View style={styles.pricingCard}>
                                <Text style={styles.pricePeriod}>ANUAL ACCESS</Text>
                                <Text style={styles.priceAmount}>$49.99</Text>
                                <Text style={styles.priceSub}>That's less than $1/week</Text>
                                <Pressable style={styles.primaryButton} onPress={onContinue}>
                                    <Text style={styles.buttonText}>TRY PRO FOR FREE</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    sheet: {
        height: '85%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#eee',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    closeX: {
        position: 'absolute',
        top: 24,
        right: 24,
    },
    h1: {
        fontSize: 28,
        fontFamily: 'Garet-Heavy',
        color: '#000',
        marginTop: 10,
    },
    h2: {
        fontSize: 16,
        fontFamily: 'Garet-Book',
        color: '#666',
        marginBottom: 15,
    },
    comparisonTable: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    colLabel: { flex: 2 },
    colFree: { flex: 1, alignItems: 'center' },
    colPro: { flex: 1, alignItems: 'center' },
    colTitle: {
        fontSize: 12,
        fontFamily: 'Garet-Heavy',
        color: '#999',
        letterSpacing: 1,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        alignItems: 'center',
    },
    rowAlt: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    rowLabel: {
        fontSize: 14,
        fontFamily: 'Garet-Book',
        color: '#333',
        paddingLeft: 10,
    },
    rowValue: {
        fontSize: 14,
        fontFamily: 'Garet-Heavy',
        color: '#000',
    },
    pricingSection: {
        marginTop: 10,
        paddingBottom: 20,
    },
    pricingCard: {
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
    },
    pricePeriod: {
        color: '#2b908f',
        fontSize: 12,
        fontFamily: 'Garet-Heavy',
        letterSpacing: 2,
    },
    priceAmount: {
        color: '#fff',
        fontSize: 40,
        fontFamily: 'Garet-Heavy',
        marginVertical: 10,
    },
    priceSub: {
        color: '#666',
        fontSize: 14,
        fontFamily: 'Garet-Book',
        marginBottom: 24,
    },
    primaryButton: {
        backgroundColor: '#2b908f',
        width: '100%',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Garet-Heavy',
    },
});
