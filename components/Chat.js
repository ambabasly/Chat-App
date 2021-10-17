import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import 
{ 
  View, 
  Alert,
  StyleSheet, 
  Platform, 
  KeyboardAvoidingView,
} from 'react-native';

import 
{ GiftedChat, 
  Bubble,
  InputToolbar
} from 'react-native-gifted-chat';

//Firebase Database
const firebase = require('firebase');
require('firebase/firestore');


export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      uid: 0,
      loggedInText: 'Please wait, you are getting logged in',
      user: {
        _id: '',
        name: '',
        avatar: '',
      },
      isConnected: false,
      image: null,
      location: null,
    };
    
    // Firebase Config
    const firebaseConfig ={
      apiKey: "AIzaSyCjhBRSiv-Y-AjqCv70pD1Hpd_iDClsFH0",
      authDomain: "chatapp-fff4f.firebaseapp.com",
      projectId: "chatapp-fff4f",
      storageBucket: "chatapp-fff4f.appspot.com",
      messagingSenderId: "470458640572",
      appId: "1:470458640572:web:dc189ccc2d71f27e5148b9"
    }

    // Connecting to Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    // References Firebase messages
    this.referenceChatMessages = firebase.firestore().collection('messages');
    this.referenceMessageUser = null;
  }

  componentDidMount() {
    //get name from start screen and change title of page to user's name
    let name = this.props.route.params.name;
    //get the name from the home screen and change the title of the page to the name of the user
    this.props.navigation.setOptions({ title: name });
    // To Check user connection
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.setState({ isConnected: true });
        console.log("online");

        // Referencing to load messages via Firebase
        this.referenceChatMessages = firebase
          .firestore().collection('messages');

        // Listen to authentication events
        this.authUnsubscribe = 
        firebase.auth().onAuthStateChanged(async (user) => {
            if (!user) {
              await firebase.auth().signInAnonymously();
            }
            // Adding user to state
            this.setState({
              uid: user.uid,
              user: {
                _id: user.uid,
                name: name,
                avatar: 'https://placeimg.com/140/140/any',
              },
              messages: [],
            });
            // Listening for collection changes for current user
            this.unsubscribeChatUser = this.referenceChatMessages
              .orderBy('createdAt', 'desc')
              .onSnapshot(this.onCollectionUpdate);
          });
      } else {
        this.setState({ isConnected: false });
        this.getMessages();
        Alert.alert(
          'No internet connection detected | Unable to send messages'
        );
      }
    });
  }
componentWillUnmount() {
  // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribe(); 
  }

  // Updating messages state
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      //console.log(data)
      if(data._id) {
        messages.push({
          _id: data._id,
          createdAt: data.createdAt.toDate(),
          text: data.text || '',
          user: {
            _id: data.user._id,
            name: data.user.name,
            avatar: data.user.avatar,
          },
          image: data.image,
          location: data.location
        });
      }
    });
    this.setState({
      messages,
    });
  }

  // Retrieving messages from client-side storage
  async getMessages() {
    let messages = '';
    try {
      messages = (await AsyncStorage.getItem('messages')) || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  // Deleting messages in client-side storage
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  }

  // Saving messages in client-side storage
  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  };

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
    () => {
      this.addMessage();
      this.saveMessages();
    });
  }
  // To only render the default InputToolbar when the user is online
  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return(
        <InputToolbar
        {...props}
        />
      );
    }
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
            renderInputToolbar={this.renderInputToolbar.bind(this)}
            renderUsernameOnMessage={true}
            renderCustomView={this.renderCustomView}
            renderActions={this.renderActions}
            messages={this.state.messages}
            onSend={messages => this.onSend(messages)}
            user={{
              _id: this.state.uid,
            avatar: 'https://placeimg.com/140/140/any',
            name: this.props.route.params.name,
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



