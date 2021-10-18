import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import firebase from "firebase";
import "firebase/firestore";

export default class CustomActions extends Component {
  //choosing photo from Library
  pickImage = async () => {
    const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
    try {
      if (status === "granted") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "Images",
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImageFetch(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // To take photo
  takePhoto = async () => {
    const { status } = await Permissions.askAsync(
      Permissions.MEDIA_LIBRARY,
      Permissions.CAMERA
    );
    try {
      if (status === "granted") {
        const result = await ImagePicker.launchCameraAsync().catch((error) =>
          console.log(error)
        );

        if (!result.cancelled) {
          const imageUrl = await this.uploadImageFetch(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // To upload image to Firebaes in blob format
  uploadImage = async (uri) => {
    try {
      // To convert image to blob format
      const blob = await new Promise((resolve, reject) => {
        // To create new XMLHttp request
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (error) {
          console.log(error);
          reject(new TypeError('Network Request Failed'));
        };
        // This opens connection to receive image data and reponds as blob
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });

      // Creates unique file names for storage
      const uriParse = uri.split('/');
      const fileName = uriParse[uriParse.length - 1];

      // Referencing remote DB 
      const ref = firebase.storage().ref().child(`images/${imageName}`);
      const snapshot = await ref.put(blob);
      //close connection
      blob.close();

      // To returns image's unique URL from the remote DB
      return await snapshot.ref.getDownloadURL();
    } catch (error) {
      console.log(error.message);
    }
  };

  //share location
  getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync(); //Permissions.askAsync(Permissions.LOCATION); ->deprecated

      if (status === "granted") {
        const result = await Location.getCurrentPositionAsync({}).catch(
          (error) => console.log(error)
        );
        const longitude = JSON.stringify(result.coords.longitude);
        const latitude = JSON.stringify(result.coords.latitude);
        if (result) {
          this.props.onSend({
            location: {
              longitude: longitude,
              latitude: latitude,
            },
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //Opening of menu
  onActionPress = () => {
    const options = [
        "Choose Image", 
        "Take Photo", 
        "Share Location", 
        "Cancel"
    ];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            console.log("Gallery");
            return this.pickImage();
          case 1:
            console.log("Camera");
            return this.takePhoto();
          case 2:
            console.log("Location");
            return this.getLocation();
          default:
        }
      }
    );
  };

  //upload media to the Firestore database.
  uploadImageFetch = async (uri) => {
    const blob = await new Promise((res, rej) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        res(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        rej(new TypeError("Network request filed!"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const imgNameBefore = uri.split("/");
    const imgName = imgNameBefore[imgNameBefore.length - 1];

    // Create a reference to the firebase storage
    const ref = firebase.storage().ref().child(`images/${imgName}`);
    const snapshot = await ref.put(blob);

    //close connection
    blob.close();

    return await snapshot.ref.getDownloadURL();
  };

  render() {
    return (
      <View>
        <TouchableOpacity
          accessible={true}
          accessibilityLabel="More options"
          accessibilityHint="Let’s you choose to send an image or your geolocation."
          style={styles.container}
          onPress={this.onActionPress}
        >
          <View style={[styles.wrapper, this.props.wrapperStyle]}>
            <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.separator}></View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 32,
    marginLeft: 5,
    marginBottom: 6,
  },
  wrapper: {
    borderRadius: 14,
    flex: 1,
  },
  iconText: {
    color: "#999",
    fontWeight: "bold",
    fontSize: 24,
    backgroundColor: "transparent",
    textAlign: "center",
  },
  separator: {
    flexDirection: "row",
    position: "absolute",
    height: 32,
    left: 40,
    width: 1,
    backgroundColor: "#ccc",
  },
});

CustomActions.contextTypes = {
// This is what pops up when you press the button in the Gifted Chat
  actionSheet: PropTypes.func,
};