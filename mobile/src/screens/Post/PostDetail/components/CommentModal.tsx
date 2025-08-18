import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../../../theme/PostDetailScreen.styles';
import { ReplyingToType } from '../../types';

interface CommentModalProps {
  visible: boolean;
  commentText: string;
  replyingTo: ReplyingToType | null;
  onChangeText: (text: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  commentText,
  replyingTo,
  onChangeText,
  onClose,
  onSubmit,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {replyingTo
                ? `回复 @${replyingTo.userName}`
                : '添加评论'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.commentInputField}
            placeholder={
              replyingTo
                ? `回复 @${replyingTo.userName}...`
                : '写下你的评论...'
            }
            value={commentText}
            onChangeText={onChangeText}
            multiline
            autoFocus
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              !commentText.trim() && styles.disabledButton,
            ]}
            disabled={!commentText.trim()}
            onPress={onSubmit}
          >
            <Text style={styles.submitButtonText}>发布</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};