import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db, auth, storage } from '../../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

// Define Social type
interface Social {
  id: string;
  senderName: string;
  senderAvatar: string | null;
  message: string;
  time: string;
  category: 'new' | 'earlier';
  friendId: string;
}

// Helper to parse challenge invitation message
function parseChallengeInvitation(message: string) {
  if (!message.startsWith('challenge_invitation:')) return null;
  try {
    const json = message.replace('challenge_invitation:', '');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Render notification/message card for Socials
function renderNotification(social: Social, router: any) {
  // Unread if category is 'new'
  const isUnread = social.category === 'new';
  const unreadStyle = { color: '#000', fontWeight: 'bold' as 'bold' };
  const senderNameStyle = [styles.senderName, isUnread && unreadStyle];
  const messageTextStyle = [styles.messageText, isUnread && unreadStyle];
  const messageTimeStyle = [styles.messageTime, isUnread && unreadStyle];
  const challenge = parseChallengeInvitation(social.message);
  const handlePress = async () => {
    if (isUnread) {
      // Mark as read in Firestore
      try {
        const user = auth.currentUser;
        if (user) {
          const chatRef = doc(db, 'chats', social.id);
          await updateDoc(chatRef, {
            [`unreadCounts.${user.uid}`]: 0
          });
        }
      } catch (e) {
        // Optionally handle error
      }
    }
    // Route to ChatScreen
    router.push({
      pathname: '/messaging/ChatScreen',
      params: {
        chatId: social.id,
        receiverId: social.friendId || '',
      },
    });
  };
  return (
    <TouchableOpacity key={social.id} style={styles.socialCard} onPress={handlePress}>
      <View style={styles.profileContainer}>
        {/* Profile Picture */}
        {social.senderAvatar ? (
          <Image source={{ uri: social.senderAvatar }} style={styles.profilePic} />
        ) : (
          <View style={styles.profilePic} />
        )}
        <View style={styles.textContainer}>
          <Text style={senderNameStyle}>{social.senderName}</Text>
          {challenge ? (
            <Text style={messageTextStyle}>
              {`${social.senderName} invited you to join "${challenge.challengeName}" challenge for ${challenge.challengeDays} days, ${challenge.challengeMins} mins per day`}
              {"\n"}Tap here to view!
            </Text>
          ) : (
            <Text style={messageTextStyle}>
              {social.senderName} just sent you a message: "{social.message}"
              {"\n"}Tap here to reply!
            </Text>
          )}
          <Text style={messageTimeStyle}>{social.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SocialsScreen() {
  const router = useRouter();
  const [socials, setSocials] = useState<Social[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  useEffect(() => {
    const fetchSocials = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setSocials([]);
        setLoading(false);
        return;
      }
      try {
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('users', 'array-contains', user.uid));
        const chatSnapshots = await getDocs(q);
        const socialsArr = [];
        for (const chatDoc of chatSnapshots.docs) {
          const chatData = chatDoc.data();
          const lastMessage = chatData.lastMessage;
          const lastSender = chatData.lastSender;
          const updatedAt = chatData.updatedAt;
          const unreadCount = chatData.unreadCounts?.[user.uid] || 0;
          const friendId = (chatData.users || []).find((id: string) => id !== user.uid);
          if (!friendId) continue;

          // Fetch friend profile
          let friendName = 'Unknown';
          let friendAvatar = null;
          try {
            const friendDoc = await getDoc(doc(db, 'users', friendId));
            if (friendDoc.exists()) {
              const friendData = friendDoc.data();
              friendName = friendData.name || 'Unknown';
              if (friendData.avatar) {
                try {
                  const avatarRef = ref(storage, friendData.avatar);
                  friendAvatar = await getDownloadURL(avatarRef);
                } catch (e) {
                  friendAvatar = null;
                }
              }
            }
          } catch (e) {}

          // Format time
          let time = '';
          if (updatedAt && updatedAt.toDate) {
            const date = updatedAt.toDate();
            time = date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          }

          socialsArr.push({
            id: chatDoc.id,
            senderName: friendName,
            senderAvatar: friendAvatar,
            message: lastMessage,
            time,
            category: (unreadCount > 0 ? 'new' : 'earlier') as 'new' | 'earlier',
            friendId,
          });
        }
        setSocials(socialsArr);
      } catch (e) {
        setSocials([]);
      }
      setLoading(false);
    };
    fetchSocials();
  }, []);

  // Fetch challenge invitations from notifications
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setInvitations([]);
      setLoadingInvitations(false);
      return;
    }
    setLoadingInvitations(true);
    const notificationsRef = collection(db, 'users', user.uid, 'notifications');
    const q = query(notificationsRef, where('type', '==', 'challenge_invitation'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const invites: any[] = [];
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        // Get sender's avatar
        let senderAvatar = undefined;
        try {
          const senderDoc = await getDoc(doc(db, 'users', data.senderId));
          const senderData = senderDoc.data();
          if (senderData && senderData.avatar) {
            const avatarRef = ref(storage, senderData.avatar);
            senderAvatar = await getDownloadURL(avatarRef);
          }
        } catch {}
        invites.push({
          id: docSnapshot.id,
          senderName: data.senderName,
          senderAvatar,
          challengeName: data.challengeName,
          challengeDays: data.challengeDays,
          challengeMins: data.challengeMins,
          challengeId: data.challengeId,
          senderId: data.senderId,
          createdAt: data.createdAt,
          read: data.read,
        });
      }
      setInvitations(invites);
      setLoadingInvitations(false);
    });
    return () => unsubscribe();
  }, []);

  // Separate the messages into 'New' and 'Earlier'
  const newMessages = socials.filter(social => social.category === 'new');
  const earlierMessages = socials.filter(social => social.category === 'earlier');

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EFF2FF' }}>
        <ActivityIndicator size="large" color="#6549FE" />
      </View>
    );
  }

  // Invitation card renderer
  function renderInvitation(invite: any) {
    const isUnread = invite.read === false;
    const unreadStyle = { color: '#000', fontWeight: 'bold' as 'bold' };
    return (
      <TouchableOpacity
        key={invite.id}
        style={styles.socialCard}
        onPress={() => {
          router.push({
            pathname: '/Challenges/ChallengeInvitation',
            params: {
              notificationId: invite.id,
              challengeId: invite.challengeId,
              senderId: invite.senderId,
            },
          });
        }}
      >
        <View style={styles.profileContainer}>
          {invite.senderAvatar ? (
            <Image source={{ uri: invite.senderAvatar }} style={styles.profilePic} />
          ) : (
            <View style={styles.profilePic} />
          )}
          <View style={styles.textContainer}>
            <Text style={[styles.senderName, isUnread && unreadStyle]}>{invite.senderName}</Text>
            <Text style={[styles.messageText, isUnread && unreadStyle]}>
              {`${invite.senderName} invited you to join "${invite.challengeName}" challenge for ${invite.challengeDays} days, ${invite.challengeMins} mins per day`}
              {"\n"}Tap here to view!
            </Text>
            <Text style={[styles.messageTime, isUnread && unreadStyle]}>
              {invite.createdAt && invite.createdAt.toDate ?
                invite.createdAt.toDate().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#6549FE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Socials</Text>
        <Ionicons name="chatbubble-outline" size={24} color="#6549FE" />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Invitations Section */}
        <View style={styles.socialsSection}>
          <Text style={styles.sectionTitle}>Invitations</Text>
          {loadingInvitations ? (
            <ActivityIndicator size="small" color="#6549FE" />
          ) : invitations.length === 0 ? (
            <Text style={{ color: '#AAA', marginBottom: 10 }}>No invitations</Text>
          ) : (
            invitations.map(renderInvitation)
          )}
        </View>
        {/* New Messages Section */}
        <View style={styles.socialsSection}>
          <Text style={styles.sectionTitle}>New</Text>
          {newMessages.map(social => renderNotification(social, router))}
        </View>
        {/* Earlier Messages Section */}
        <View style={styles.socialsSection}>
          <Text style={styles.sectionTitle}>Earlier</Text>
          {earlierMessages.map(social => renderNotification(social, router))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF2FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
  },
  scrollContent: {
    padding: 20,
  },
  socialsSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6549FE',
    marginBottom: 10,
  },
  socialCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D3D3D3', // Grey background to indicate no image
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 12,
    color: '#AAA',
  },
});
