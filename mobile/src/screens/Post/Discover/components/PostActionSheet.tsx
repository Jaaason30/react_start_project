import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';

interface PostActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectGallery: () => void;
  onTakePhoto: () => void;
  onTextPost: () => void;
  onTemplatePost: () => void;
}

export const PostActionSheet: React.FC<PostActionSheetProps> = ({
  visible,
  onClose,
  onSelectGallery,
  onTakePhoto,
  onTextPost,
  onTemplatePost,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <TouchableOpacity style={styles.option} onPress={onSelectGallery}>
          <Text style={styles.optionText}>从相册中选择</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={onTakePhoto}>
          <Text style={styles.optionText}>拍照</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={onTextPost}>
          <Text style={styles.optionText}>文字</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={onTemplatePost}>
          <Text style={styles.optionText}>从模板中选择</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000066',
  },
  sheet: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  option: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
});