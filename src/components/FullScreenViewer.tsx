import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Surface, IconButton, Portal, Modal, Chip } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import Markdown from 'react-native-markdown-display';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface FullScreenViewerProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  content: string;
  tags?: string[];
  type?: 'note' | 'deck' | 'flashcard';
}

const FullScreenViewer: React.FC<FullScreenViewerProps> = ({
  visible,
  onDismiss,
  title,
  content,
  tags = [],
  type = 'note',
}) => {
  const { theme } = useTheme();
  const slideY = useSharedValue(height);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      slideY.value = withSpring(0, { damping: 20 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      slideY.value = withTiming(height, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: slideY.value }],
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

  const markdownStyles = {
    body: {
      color: theme.colors.onSurface,
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'System',
    },
    heading1: {
      color: theme.colors.onSurface,
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 16,
    },
    heading2: {
      color: theme.colors.onSurface,
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 12,
    },
    code_inline: {
      backgroundColor: theme.colors.surfaceVariant,
      color: getTypeColor(),
      padding: 4,
      borderRadius: 4,
      fontFamily: 'Courier',
    },
    code_block: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
    },
    blockquote: {
      backgroundColor: theme.colors.surfaceVariant,
      borderLeftColor: getTypeColor(),
      borderLeftWidth: 4,
      padding: 12,
      marginVertical: 8,
    },
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Animated.View style={[styles.container, animatedStyle]}>
          <Surface 
            style={[
              styles.surface, 
              { backgroundColor: theme.colors.surface }
            ]} 
            elevation={8}
          >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: getTypeColor() }]}>
              <View style={styles.headerContent}>
                <Text style={styles.typeIcon}>{getTypeIcon()}</Text>
                <Text 
                  variant="headlineSmall" 
                  style={styles.headerTitle}
                  numberOfLines={2}
                >
                  {title}
                </Text>
              </View>
              <IconButton
                icon="close"
                size={24}
                onPress={onDismiss}
                iconColor="#FFFFFF"
              />
            </View>

            {/* Tags */}
            {tags.length > 0 && (
              <View style={styles.tagsSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {tags.map((tag) => (
                    <Chip 
                      key={tag} 
                      style={[
                        styles.fullTag, 
                        { backgroundColor: getTypeColor() + '20' }
                      ]}
                      textStyle={[
                        styles.fullTagText, 
                        { color: getTypeColor() }
                      ]}
                    >
                      {tag}
                    </Chip>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Content */}
            <ScrollView 
              style={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.contentPadding}>
                {type === 'note' ? (
                  <Markdown style={markdownStyles}>
                    {content}
                  </Markdown>
                ) : (
                  <Text 
                    style={[
                      styles.plainText, 
                      { color: theme.colors.onSurface }
                    ]}
                  >
                    {content}
                  </Text>
                )}
              </View>
            </ScrollView>
          </Surface>
        </Animated.View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.95,
    height: height * 0.9,
  },
  surface: {
    borderRadius: 20,
    overflow: 'hidden',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    flex: 1,
    fontFamily: 'System',
  },
  tagsSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  fullTag: {
    marginRight: 8,
    height: 32,
  },
  fullTagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  contentPadding: {
    padding: 20,
  },
  plainText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'System',
  },
});

export default FullScreenViewer;
