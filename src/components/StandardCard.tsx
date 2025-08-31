import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Surface, Chip, IconButton } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withDelay 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // Standard card width with margins
const CARD_HEIGHT = 140; // Fixed height for consistency

interface StandardCardProps {
  title: string;
  content: string;
  tags?: string[];
  onPress?: () => void;
  onMenuPress?: () => void;
  delay?: number;
  type?: 'note' | 'deck' | 'flashcard';
  progress?: number;
  cardCount?: number;
}

const StandardCard: React.FC<StandardCardProps> = ({
  title,
  content,
  tags = [],
  onPress,
  onMenuPress,
  delay = 0,
  type = 'note',
  progress,
  cardCount,
}) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { damping: 15 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 15 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const getTypeIcon = () => {
    switch (type) {
      case 'note': return '📝';
      case 'deck': return '📚';
      case 'flashcard': return '🃏';
      default: return '📄';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'note': return theme.colors.primary;
      case 'deck': return theme.colors.secondary;
      case 'flashcard': return theme.colors.tertiary;
      default: return theme.colors.primary;
    }
  };

  // Trim content to fit card size
  const trimmedContent = content.length > 120 ? content.substring(0, 120) + '...' : content;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Surface 
          style={[
            styles.card, 
            { 
              backgroundColor: theme.colors.surface,
              borderLeftColor: getTypeColor(),
            }
          ]} 
          elevation={3}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.typeIcon}>{getTypeIcon()}</Text>
              <Text 
                variant="titleMedium" 
                style={[
                  styles.title, 
                  { color: theme.colors.onSurface }
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
            </View>
            {onMenuPress && (
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={onMenuPress}
                iconColor={theme.colors.onSurfaceVariant}
              />
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text 
              variant="bodyMedium" 
              style={[
                styles.contentText, 
                { color: theme.colors.onSurfaceVariant }
              ]}
              numberOfLines={3}
            >
              {trimmedContent}
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {/* Tags */}
            <View style={styles.tagsContainer}>
              {tags.slice(0, 2).map((tag, index) => (
                <Chip 
                  key={tag} 
                  style={[
                    styles.tag, 
                    { backgroundColor: getTypeColor() + '20' }
                  ]}
                  textStyle={[
                    styles.tagText, 
                    { color: getTypeColor() }
                  ]}
                >
                  {tag}
                </Chip>
              ))}
              {tags.length > 2 && (
                <Text style={[styles.moreText, { color: theme.colors.onSurfaceVariant }]}>
                  +{tags.length - 2} more
                </Text>
              )}
            </View>

            {/* Progress or Card Count */}
            {(progress !== undefined || cardCount !== undefined) && (
              <View style={styles.statsContainer}>
                {cardCount !== undefined && (
                  <Text style={[styles.statsText, { color: theme.colors.onSurfaceVariant }]}>
                    {cardCount} cards
                  </Text>
                )}
                {progress !== undefined && (
                  <Text style={[styles.progressText, { color: getTypeColor() }]}>
                    {Math.round(progress)}%
                  </Text>
                )}
              </View>
            )}
          </View>
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
    padding: 16,
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'System', // Use system font for better readability
    flex: 1,
  },
  content: {
    flex: 1,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System',
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tag: {
    height: 24,
    marginRight: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  moreText: {
    fontSize: 11,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: 11,
    opacity: 0.7,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
});

export default StandardCard;
