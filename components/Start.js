import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Image, 
  ImageBackground, 
  StyleSheet, 
  Pressable, 
  TouchableOpacity } 
  from 'react-native';

export default class Start extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      backgroundColor: '#FFFFFF'
    };
  }

  //When the user clicks on the "Start Chat" button, the name and the background color chosen by the user are sent to the chat screen
  startChatting = (name, backgroundColor) => {
    this.props.navigation.navigate('Chat', {
      name: this.state.name,
      backgroundColor: this.state.backgroundColor
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground source={require('../assets/background-image.png')} resizeMode="cover" style={styles.image}>
          <View style={styles.box1}>
            <Text style={styles.title}>Chat App</Text>
          </View>
          <View style={styles.box2}>
            <View style={styles.infoContainer}>
              <View style={styles.inputContainer}>
                <Image
                  style={styles.inputIcon}
                  source={require('../assets/user-icon.svg')}
                />
                <TextInput
                  style={styles.input}
                  /* when the user enters his name, the name status changes to his name. */
                  onChangeText={(name) => this.setState({ name })}
                  value={this.state.name}
                  placeholder='Your Name'
                />
              </View>
              <Text style={styles.chooseColorText}>Choose Background Color</Text>
              <View style={styles.colorsContainer}>
                {/* When the user clicks on a color, the background color status changes to that color */}
                <TouchableOpacity
                  style={[styles.colorOptions, { backgroundColor: '#090C08' }]}
                  onPress={() => this.setState({ backgroundColor: '#090C08' })} />
                <TouchableOpacity
                  style={[styles.colorOptions, { backgroundColor: '#474056' }]}
                  onPress={() => this.setState({ backgroundColor: '#474056' })} />
                <TouchableOpacity
                  style={[styles.colorOptions, { backgroundColor: '#8A95A5' }]}
                  onPress={() => this.setState({ backgroundColor: '#8A95A5' })} />
                <TouchableOpacity
                  style={[styles.colorOptions, { backgroundColor: '#B9C6AE' }]}
                  onPress={() => this.setState({ backgroundColor: '#B9C6AE' })} />
              </View>
              <Pressable
                style={styles.button}
                title="Start Chatting"
                //send the name and background color status when the user clicks the Start Chat button.
                onPress={() => this.startChatting(this.state.name, this.state.backgroundColor)}
              >
                <Text style={styles.buttonText}>Start Chatting</Text>
              </Pressable>
            </View>
          </View>
        </ImageBackground>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center'
  },
  image: {
    flex: 1,
    justifyContent: 'center'
  },

  box1: {
    flex: 56,
    justifyContent: 'center',
    textAlign: 'center'
  },
  title: {
    fontSize: 45,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center'
  },

  box2: {
    flex: 44,
    alignItems: 'center',
  },
  infoContainer: {
    height: 250,
    backgroundColor: 'white',
    width: '88%',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 15,
    paddingBottom: 15
  },
  inputContainer: {
    width: '88%',
  },
  inputIcon: {
    height: 20,
    width: 20,
    position: 'absolute',
    top: 15,
    left: 12,
    opacity: 0.5
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    opacity: 0.5,
    padding: 10,
    paddingLeft: 45
  },
  colorsContainer: {
    width: '85%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  chooseColorText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083'
  },
  colorOptions: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  button: {
    height: 50,
    backgroundColor: '#757083',
    width: '88%',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center'
  }
});
