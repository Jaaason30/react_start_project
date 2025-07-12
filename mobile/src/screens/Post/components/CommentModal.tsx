// src/screens/Post/components/CommentModal.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../../theme/PostDetailScreen.styles';

interface CommentModalProps {
  visible: boolean;
  commentText: string;
  replyingToUser?: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  commentText,
  replyingToUser,
  onChangeText,
  onClose,
  onSubmit,
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.modalContainer}
    >
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {replyingToUser ? `回复 @${replyingToUser}` : '添加评论'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.commentInputField}
          placeholder={
            replyingToUser ? `回复 @${replyingToUser}...` : '写下你的评论...'
          }
          value={commentText}
          onChangeText={onChangeText}
          multiline
          autoFocus
        />
        <TouchableOpacity
          style={[styles.submitButton, !commentText.trim() && styles.disabledButton]}
          disabled={!commentText.trim()}
          onPress={onSubmit}
        >
          <Text style={styles.submitButtonText}>发布</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

export default CommentModal;
