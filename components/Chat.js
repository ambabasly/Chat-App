import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import MapView from 'react-native-maps';
import CustomActions from './CustomActions';
import 
{ 
  View, 
  Alert,
  StyleSheet, 
  Platform,
  KeyboardAvoidingView,
  LogBox
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
    //this.referenceMessageUser = null;

    // This ignore warning message in the console
    LogBox.ignoreLogs([
      'Setting a timer',
      'Warning: ...',
      'undefined',
      'Animated.event now requires a second argument for options',
    ]);
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
        Alert.alert('No internet connection detected | Unable to send messages');
      }
    });
  }
componentWillUnmount() {
  // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribeChatUser(); 
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
  getMessages = async () => {
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
  deleteMessages = async () => {
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
  saveMessages = async () => {
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
      image: message.image || '',
      location: message.location || null,
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
          right: { backgroundColor: '#000'}
        }}
      />
    )
  }
  //function is responsible for creating the circle button
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

    // Returns a MapView that shows user's location
    renderCustomView(props) {
      const { currentMessage } = props;
      if (currentMessage.location) {
        return (
          <MapView
            showsUserLocation={true}
            style={{
              width: 150,
              height: 100,
              borderRadius: 13,
              margin: 8,
            }}
            region={{
              longitude: Number(currentMessage.location.longitude),
              latitude: Number(currentMessage.location.latitude),
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,   
            }}
          />
        );
      }
      return null;
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
            //custom actions to take photo, select photo, send location
            renderCustomView={this.renderCustomView}
            renderActions={this.renderCustomActions}
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





