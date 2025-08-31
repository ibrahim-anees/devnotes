import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Surface, Chip, Button, ProgressBar } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { Flashcard } from '../types';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = 160;

interface EnhancedFlashcardCardProps {
  flashcard: Flashcard;
  onPress?: () => void;
  onLongPress?: () => void;
  onViewMore?: () => void;
  delay?: number;
  isSelected?: boolean;
  showProgress?: boolean;
}

const EnhancedFlashcardCard: React.FC<EnhancedFlashcardCardProps> = ({
  flashcard,
  onPress,
  onLongPress,
  onViewMore,
  delay = 0,
  isSelected = false,
  showProgress = true,
}) => {
  const { theme } = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const flipRotation = useSharedValue(0);
  const selectionScale = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 15 });
  }, []);

  React.useEffect(() => {
    selectionScale.value = withSpring(isSelected ? 0.95 : 1, { damping: 15 });
  }, [isSelected]);

  const handleFlip = () => {
    flipRotation.value = withSpring(
      isFlipped ? 0 : 180,
      { damping: 15 },
      () => {
        runOnJS(setIsFlipped)(!isFlipped);
      }
    );
  };

  const getCategoryColor = (tags: string[]) => {
    if (tags.includes('javascript') || tags.includes('js')) return '#F7DF1E';
    if (tags.includes('react')) return '#61DAFB';
    if (tags.includes('algorithm')) return '#4CAF50';
    if (tags.includes('python')) return '#3776AB';
    if (tags.includes('css')) return '#1572B6';
    return theme.colors.primary;
  };

  const getMasteryProgress = () => {
    if (!flashcard.lastReviewed) return 0;
    const daysSinceReview = Math.floor(
      (Date.now() - flashcard.lastReviewed.getTime()) / (1000 * 60 * 60 * 24)
    );
    const targetInterval = flashcard.interval || 1;
    return Math.min(daysSinceReview / targetInterval, 1);
  };

  const trimText = (text: string, maxLength: number = 80) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value * selectionScale.value },
    ],
  }));

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipRotation.value}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipRotation.value + 180}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const categoryColor = getCategoryColor(flashcard.tags);
  const masteryProgress = getMasteryProgress();

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={() => {
          handleFlip();
          onLongPress?.();
        }}
        activeOpacity={0.8}
      >
        <Surface 
          style={[
            styles.card, 
            { 
              backgroundColor: theme.colors.surface,
              borderLeftColor: categoryColor,
            },
            isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }
          ]} 
          elevation={isSelected ? 6 : 3}
        >
          {/* Front Side */}
          <Animated.View style={[styles.cardSide, frontAnimatedStyle]}>
            <View style={styles.header}>
              <Text 
                variant="titleMedium" 
                style={[styles.frontText, { color: theme.colors.onSurface }]}
                numberOfLines={2}
              >
                {trimText(flashcard.front)}
              </Text>
              <View style={styles.difficultyIndicator}>
                <View 
                  style={[
                    styles.difficultyDot, 
                    { backgroundColor: flashcard.difficulty === 'hard' ? '#EF4444' : 
                                     flashcard.difficulty === 'medium' ? '#F59E0B' : '#10B981' }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.content}>
              <Text 
                variant="bodyMedium" 
                style={[styles.previewText, { color: theme.colors.onSurfaceVariant }]}
                numberOfLines={2}
              >
                {trimText(flashcard.back, 60)}
              </Text>
            </View>

            <View style={styles.footer}>
              <View style={styles.tagsContainer}>
                {flashcard.tags.slice(0, 2).map((tag) => (
                  <Chip 
                    key={tag} 
                    style={[styles.tag, { backgroundColor: '#3B82F6' + '20' }]}
                    textStyle={[styles.tagText, { color: '#3B82F6' }]}
                  >
                    {tag}
                  </Chip>
                ))}
                {flashcard.tags.length > 2 && (
                  <Text style={[styles.moreText, { color: theme.colors.onSurfaceVariant }]}>
                    +{flashcard.tags.length - 2}
                  </Text>
                )}
              </View>

              <Button
                mode="text"
                onPress={onViewMore}
                style={styles.viewMoreButton}
                labelStyle={styles.viewMoreText}
              >
                View More
              </Button>
            </View>

            {showProgress && (
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={masteryProgress} 
                  style={styles.progressBar}
                  color="#84CC16"
                />
                <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
                  Mastery: {Math.round(masteryProgress * 100)}%
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Back Side */}
          <Animated.View style={[styles.cardSide, styles.backSide, backAnimatedStyle]}>
            <View style={styles.backHeader}>
              <Text 
                variant="titleSmall" 
                style={[styles.backLabel, { color: theme.colors.primary }]}
              >
                Answer
              </Text>
            </View>
            
            <View style={styles.backContent}>
              <Text 
                variant="bodyMedium" 
                style={[styles.backText, { color: theme.colors.onSurface }]}
                numberOfLines={4}
              >
                {flashcard.back}
              </Text>
            </View>

            <View style={styles.backFooter}>
              <Button
                mode="contained"
                onPress={handleFlip}
                style={[styles.flipBackButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={styles.flipBackText}
              >
                Flip Back
              </Button>
            </View>
          </Animated.View>
        </Surface>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    marginHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  cardSide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    padding: 16,
  },
  backSide: {
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  frontText: {
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  difficultyIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tag: {
    height: 22,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  moreText: {
    fontSize: 10,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  viewMoreButton: {
    marginLeft: 8,
  },
  viewMoreText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
  },
  backHeader: {
    marginBottom: 12,
  },
  backLabel: {
    fontWeight: '700',
    fontSize: 14,
  },
  backContent: {
    flex: 1,
  },
  backText: {
    fontSize: 14,
    lineHeight: 20,
  },
  backFooter: {
    alignItems: 'center',
  },
  flipBackButton: {
    borderRadius: 20,
  },
  flipBackText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default EnhancedFlashcardCard;
