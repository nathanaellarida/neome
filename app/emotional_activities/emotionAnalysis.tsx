import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
//import SentenceEmotionAnalyzer from './sentenceEmotionAnalyzer';



interface EmotionalInsights {
  dominant_insight: string;
  combination_insight: string;
  reflection_point: string;
}

interface Charts {
  line_chart?: string;
  bar_chart?: string;
  radar_chart?: string;
}

export interface AnalysisResult {
  emotional_summary?: Record<string, number>;
  dominant_emotion?: string;
  predicted_emotion?: string;
  confidence?: number;
  stress?: number;
  anxiety?: number;
  motivation?: number;
  insights?: EmotionalInsights;
  charts?: Charts;
  segment_count?: number;
}

const DEFAULT_IP = '192.168.1.8';
const API_URL = `http://${DEFAULT_IP}:5000/analyze-journal`;
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const MODEL_NAME = 'gemini-2.0-flash';

export default function EmotionalAnalysis({ journalText }: { journalText: string }) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    summary: true,
    insights: false,
    recommendations: false,
  });

  useEffect(() => {
    analyzeJournal();
  }, []);

  const analyzeJournal = async () => {
    if (!journalText || journalText.trim().length < 10) {
      Alert.alert('Too short', 'Journal entry is too short to analyze.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: journalText }),
      });
      const text = await response.text();
      const data = JSON.parse(text);
      setAnalysis(data);
      await getAIRecommendation(journalText, data.dominant_emotion || 'neutral');
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze journal.');
    } finally {
      setLoading(false);
    }
  };

  const getAIRecommendation = async (journal: string, dominantEmotion: string) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `Based on this journal: \"${journal}\", where the person feels ${dominantEmotion}, provide a 3-sentence motivational message with an inspiring quote. Avoid cliches.` }
                ]
              }
            ]
          }),
        }
      );
      const data = await response.json();
      const message = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      if (message) setRecommendation(message);
      const shortAffirmation = await getShortAffirmation(dominantEmotion);
      if (shortAffirmation) setAffirmation(shortAffirmation);
    } catch (error) {
      console.error('Gemini Error:', error);
      setRecommendation('Stay strong! Your emotions are valid. 🌸');
      setAffirmation('You are enough, exactly as you are.');
    } finally {
      setLoadingAdvice(false);
    }
  };

  const getShortAffirmation = async (dominantEmotion: string) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `The person feels ${dominantEmotion}. Provide a short paragraph, warm, affirming message to support and validate this emotion. Avoid giving advice.` }
                ]
              }
            ]
          }),
        }
      );
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
      console.error('Gemini Affirmation Error:', error);
      return null;
    }
  };

  const toggleSection = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      joy: '#FFD700',
      love: '#FF69B4',
      sadness: '#4682B4',
      anger: '#DC143C',
      fear: '#800080',
      surprise: '#32CD32',
      neutral: '#999999',
    };
    return colors[emotion.toLowerCase()] || '#999';
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 20 }} />;
  }

  if (!analysis) {
    return <Text style={{ textAlign: 'center', color: '#666' }}>No analysis available.</Text>;
  }

  const dominantEmotion = analysis.dominant_emotion || analysis.predicted_emotion || 'neutral';

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        
      {/* Emotional Summary Section */}
      <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('summary')}>
        <Text style={styles.sectionTitle}>Emotional Summary</Text>
        <Ionicons name={expanded.summary ? 'chevron-up' : 'chevron-down'} size={24} color="#8B5CF6" />
      </TouchableOpacity>

      {expanded.summary && (
        <View>
          <View style={styles.dominantEmotionCard}>
            <MaterialCommunityIcons name="emoticon-outline" size={40} color={getEmotionColor(dominantEmotion)} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.dominantEmotionLabel}>Dominant Emotion</Text>
              <Text style={[styles.dominantEmotionValue, { color: getEmotionColor(dominantEmotion) }]}> {dominantEmotion.toUpperCase()} </Text>
              {analysis.confidence && (
                <Text style={styles.confidenceText}>Confidence: {(analysis.confidence * 100).toFixed(1)}%</Text>
              )}
            </View>
          </View>

          {/* Emotional Summary */}
          {analysis.emotional_summary && (
            <>
              <Text style={styles.sectionTitle}>Emotional Summary</Text>
              {Object.entries(analysis.emotional_summary).map(([emotion, value]) => (
                <View key={emotion} style={styles.metricItem}>
                  <Text style={styles.metricLabel}>
                    {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                  </Text>
                  <View style={styles.metricBarBackground}>
                    <View style={[styles.metricBar, { width: `${value * 100}%`, backgroundColor: getEmotionColor(emotion) }]} />
                  </View>
                  <Text style={styles.metricValue}>{(value * 100).toFixed(1)}%</Text>
                </View>
              ))}
            </>
          )}
        </View>
      )}

      {/* AI Motivation Section */}
      <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('recommendations')}>
        <Text style={styles.sectionTitle}>NeomeAI Motivation</Text>
        <Ionicons name={expanded.recommendations ? 'chevron-up' : 'chevron-down'} size={24} color="#8B5CF6" />
      </TouchableOpacity>

      {expanded.recommendations && (
        <View style={styles.insightBox}>
          {loadingAdvice ? (
            <ActivityIndicator size="small" color="#8B5CF6" style={{ marginTop: 10 }} />
          ) : (
            <>
              {recommendation && (
                <>
                  <Text style={styles.insightText}>{recommendation}</Text>
                  <View style={{ marginVertical: 10 }} />
                </>
              )}
              {affirmation && (
                <Text style={[styles.insightText, { fontStyle: 'italic', color: '#666' }]}>💬 {affirmation}</Text>
              )}
            </>
          )}
        </View>
      )}

      {/* Emotional Insights Section */}
      <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('insights')}>
        <Text style={styles.sectionTitle}>Emotional Insights</Text>
        <Ionicons name={expanded.insights ? 'chevron-up' : 'chevron-down'} size={24} color="#8B5CF6" />
      </TouchableOpacity>

      {expanded.insights && analysis.insights && (
        <View style={styles.insightBox}>
          {Object.values(analysis.insights).map((text, idx) => (
            <Text key={idx} style={styles.insightText}>{text}</Text>
          ))}
        </View>

        
      )}

      {/* Sentence-Level Emotional Highlighting 
      <SentenceEmotionAnalyzer journalText={journalText} triggerAnalyze={true} />*/}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0f7ff', padding: 15, marginTop: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  dominantEmotionCard: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  dominantEmotionLabel: { fontSize: 14, color: '#555' },
  dominantEmotionValue: { fontSize: 24, fontWeight: 'bold' },
  confidenceText: { marginTop: 4, fontSize: 13, color: '#666' },
  metricItem: { paddingHorizontal: 16, paddingVertical: 8 },
  metricLabel: { fontSize: 14, fontWeight: '600', marginBottom: 5 },
  metricBarBackground: { height: 10, backgroundColor: '#eee', borderRadius: 5, overflow: 'hidden' },
  metricBar: { height: '100%', backgroundColor: '#8B5CF6' },
  metricValue: { fontSize: 12, textAlign: 'right', marginTop: 2, color: '#555' },
  insightBox: { padding: 16, backgroundColor: '#fafafa' },
  insightText: { fontSize: 15, lineHeight: 22, color: '#444', marginBottom: 10 },
  chartImage: { width: '100%', height: 220, borderRadius: 8, backgroundColor: '#f9f9f9', marginVertical: 10 },
});
