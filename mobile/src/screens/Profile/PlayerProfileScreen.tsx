// PlayerProfileScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, FlatList, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const mockPinnedPhotos = [
  { id: '1', uri: 'https://picsum.photos/400/400?1' },
  { id: '2', uri: 'https://picsum.photos/400/400?2' },
  { id: '3', uri: 'https://picsum.photos/400/400?3' },
    { id: '4', uri: 'https://picsum.photos/400/400?3' },
      { id: '5', uri: 'https://picsum.photos/400/400?3' },
];

const mockPosts = [
  { id: 'p1', title: 'Post Title One', time: '2 hours ago', image: 'https://picsum.photos/800/400?1', ongoing: true, popular: false },
  { id: 'p2', title: 'Post Title Two', time: 'Yesterday', image: 'https://picsum.photos/800/400?2', ongoing: false, popular: true },
];

export default function PlayerProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Identity Section */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <TouchableOpacity>
          <Image
            source={{ uri: 'https://picsum.photos/200' }}
            style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#fff' }}
          />
        </TouchableOpacity>
        <View style={{ marginLeft: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Username</Text>
          <TouchableOpacity>
            <Text style={{ color: '#888' }}>ID: user12345</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Data Dashboard */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12 }}>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>150</Text>
          <Text style={{ color: '#888' }}>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>180</Text>
          <Text style={{ color: '#888' }}>Following</Text>
        </TouchableOpacity>
      </View>

      {/* Pinned Album */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16 }}>
        {mockPinnedPhotos.map(photo => (
          <TouchableOpacity key={photo.id} style={{ marginRight: 12 }}>
            <Image
              source={{ uri: photo.uri }}
              style={{ width: 100, height: 100, borderRadius: 8 }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Post Feed */}
      <FlatList
        data={mockPosts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ margin: 16, backgroundColor: '#f9f9f9', borderRadius: 8, overflow: 'hidden' }}>
            <Image source={{ uri: item.image }} style={{ width: '100%', height: 200 }} />
            <View style={{ padding: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.title}</Text>
              <Text style={{ color: '#888', marginTop: 4 }}>{item.time}</Text>
              {item.ongoing && (
                <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: '#555', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>Ongoing</Text>
                </View>
              )}
              {item.popular && (
                <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: '#f33', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>🔥 Popular</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Bottom Navigation */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderTopWidth: 1, borderColor: '#eee' }}>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <Ionicons name='heart-outline' size={24} color={'#222'} />
          <Text style={{ fontSize: 12 }}>Match</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <Ionicons name='chatbubbles-outline' size={24} color={'#222'} />
          <Text style={{ fontSize: 12 }}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <Ionicons name='apps-outline' size={24} color={'#222'} />
          <Text style={{ fontSize: 12 }}>Square</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <Ionicons name='person-outline' size={24} color={'#d81e06'} />
          <Text style={{ fontSize: 12, color: '#d81e06' }}>Me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
