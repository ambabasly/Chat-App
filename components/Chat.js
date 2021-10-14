import React from 'react';
import 
{ 
  View, 
  StyleSheet, 
  Platform, 
  KeyboardAvoidingView,
  LogBox  
} from 'react-native';

import 
{ GiftedChat, 
  Bubble,
  Button
} from 'react-native-gifted-chat';

//Firebase Database
const firebase = require('firebase');
require('firebase/firestore');


export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      uid: 0,
      loggedInText: "Please wait, you are getting logged in",
    }
    // Firebase Config
    const firebaseConfig ={
      apiKey: "AIzaSyCjhBRSiv-Y-AjqCv70pD1Hpd_iDClsFH0",
      authDomain: "chatapp-fff4f.firebaseapp.com",
      projectId: "chatapp-fff4f",
      storageBucket: "chatapp-fff4f.appspot.com",
      messagingSenderId: "470458640572",
      appId: "1:470458640572:web:dc189ccc2d71f27e5148b9"
    }

    // Connect to Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    // References Firebase messages
    this.referenceChatMessages = firebase.firestore().collection('messages');
  }

  // Updating messages state
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        createdAt: data.createdAt.toDate(),
        text: data.text || '',
        user: {
          _id: data.user._id,
          name: data.user.name,
        },
        image: data.image,
        location: data.location
      });
    });
    this.setState({
      messages,
    });
  }

  // Adding messages to cloud storage
  addMessage() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      _id: message._id,
      uid: this.state.uid,
      createdAt: message.createdAt,
      text: message.text || '',
      user: message.user,
    });
  }
  //when a user clicks Send, attach the new message to the message status object
  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }),
  )
}

componentDidMount() {
  //get name from start screen and change title of page to user's name
  let name = this.props.route.params.name;
  //get the name from the home screen and change the title of the page to the name of the user
  this.props.navigation.setOptions({ title: name });

  // listen to authentication events
  this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      firebase.auth().signInAnonymously();
    }

  //update user state with currently active user data
  this.setState({
    uid: user.uid,
    loggedInText: 'Hello there',
  });

  this.unsubscribe = this.referenceChatMessages
     .orderBy("createdAt", "desc")
     .onSnapshot(this.onCollectionUpdate);
  // Create reference to the active users messages
    this.referenceChatMessages = firebase.firestore().collection('messages').where("uid", "==", this.state.uid);
  });
}

componentWillUnmount() {
  // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribe(); 
}

  //when a user clicks Send, attach the new message to the message status object
  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
  }

//Change the color of the right bubble (of the sender
renderBubble(props) {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: '#000'
        }
      }}
    />
  )
} 

  render() {
    //get the name and background color that the user selected on the home screen to change the
    let { backgroundColor } = this.props.route.params;

    return (
      <View style={[styles.container, 
      { backgroundColor: backgroundColor }]}>
        <View style={styles.giftedChat}>
          <GiftedChat
            //change the color of the chat bubble
            renderBubble={this.renderBubble.bind(this)}
            renderUsernameOnMessage={true}
            renderCustomView={this.renderCustomView}
            renderActions={this.renderActions}
            messages={this.state.messages}
            onSend={messages => this.onSend(messages)}
            user={{
              _id: 1,
            }}
          />  
          {Platform.OS === 'android' ? 
          <KeyboardAvoidingView behavior="height" /> : null}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    alignItems: 'center'
  },
  giftedChat: {
    flex: 1,
    width: '88%',
    paddingBottom: 10,
    justifyContent: 'center'
  }
});