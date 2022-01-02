import React from "react";
import { DEBUG_TRANSACTIONS } from "../constants";
const { ethers } = require("ethers");

const imageTypes = ["jpg", "jpeg", "png", "gif"];
const isValidHTTPUrl = input => {
  try {
    const url = new URL(input);
    // check if the input includes a image file type
    return url && imageTypes.some(el => input.toLowerCase().includes(el));
  } catch (e) {
    return false;
  }
};

export default function Profile({ isLoggedIn, address, userProfile, setUserProfile, tx, writeContracts }) {
  const createProfilePage = () => {
    const handleCreateClick = () => {
      const _image1 = document.getElementById("image1").value;
      if (!_image1) {
        // for now no requirement to upload an image
        // alert("plz upload an image");
        // return;
      } else if (!isValidHTTPUrl(_image1)) {
        alert("Image input is not a valid url. Please try again");
        return;
      }
      const _name = document.getElementById("name").value;
      if (!_name || _name === "") {
        alert("Empty name input");
        return;
      }
      const _bio = document.getElementById("bio").value;
      if (!_bio || _bio === "") {
        alert("Empty bio input");
        return;
      }
      if (isLoggedIn) {
        try {
          // send local eth if in debug mode
          if (DEBUG_TRANSACTIONS) {
            tx({
              to: address,
              value: ethers.utils.parseEther("0.1"),
            });
          }
          tx(writeContracts.TinderChain.createUserProfileFlow(address, _name, _image1, "", "", _bio));
        } catch (e) {
          console.log(e);
        }
      }
      // always set the profile, so it's just in state for burner mode
      setUserProfile({ address, name: _name, images: [_image1, "", ""], bio: _bio });
    };

    return (
      <>
        {isLoggedIn ? (
          <>
            <h2>You must create a profile to swipe</h2>
            <h2>Get 100 matchcoins free when you create a profile attached to your wallet</h2>
          </>
        ) : (
          <>
            <h2>You must create a burner profile to swipe</h2>
            <h2>Or connect your crypto wallet for your account to be saved on the ETH blockchain</h2>
            <h2>Get 100 matchcoins free when you create a profile attached to your wallet</h2>
          </>
        )}
        <label>Name</label>
        <input type="text" id="name"></input>
        <br />
        <label>HTTP URL to profile image</label>
        <input type="text" id="image1"></input>
        <br />
        <label>Bio</label>
        <input type="text" id="bio"></input>
        <br />
        <button onClick={() => handleCreateClick()}>Submit</button>
      </>
    );
  };

  const editProfilePage = () => {
    const handleEditClick = () => {
      let didNameChange = false;
      let didBioChange = false;
      let didImage1Change = false;
      const _image1 = document.getElementById("image1").value;
      if (_image1 !== "" && _image1 != image1) {
        if (!isValidHTTPUrl(_image1)) {
          alert("Image input is not a valid url. Please try again");
          return;
        } else {
          didImage1Change = true;
        }
      }

      const _name = document.getElementById("name").value;
      if (_name && _name !== name && _name !== "") {
        didNameChange = true;
      }
      const _bio = document.getElementById("bio").value;
      if (_bio && _bio !== bio && _bio !== "") {
        didBioChange = true;
      }

      if (didNameChange || didBioChange || didImage1Change) {
        // only make transactions if there is a wallet connected
        if (isLoggedIn) {
          try {
            // send local eth if in debug mode before transaction
            if (DEBUG_TRANSACTIONS) {
              tx({
                to: address,
                value: ethers.utils.parseEther("0.1"),
              });
            }
            tx(
              writeContracts.TinderChain.editProfile(
                address,
                didNameChange,
                _name,
                didImage1Change,
                _image1,
                false,
                "",
                false,
                "",
                didBioChange,
                _bio,
              ),
            );
          } catch (e) {
            console.log(e);
          }
        }

        const updatedName = didNameChange ? _name : userProfile.name;
        const updatedImage = didImage1Change ? _image1 : userProfile.images[0];
        const updatedBio = didBioChange ? _bio : userProfile.bio;

        setUserProfile({
          ...userProfile,
          name: updatedName,
          bio: updatedBio,
          images: [updatedImage, userProfile.images[1], userProfile.images[2]],
        });
      }
    };

    return (
      <>
        {isLoggedIn ? (
          <h2>Here you can edit your profile</h2>
        ) : (
          <>
            <h2>Here you can edit your burner profile</h2>
            <h2>Or connect your crypto wallet for your account to be saved on the ETH blockchain</h2>
          </>
        )}
        <label>Name</label>
        <input type="text" id="name" placeholder={userProfile.name}></input>
        <br />
        <img alt="your image link doesn't work :(" src={userProfile.images[0]} />
        <br />
        <label>HTTP URL to profile image</label>
        <input type="text" id="image1" placeholder={userProfile.images[0]}></input>
        <br />
        <label>Bio</label>
        <input type="text" id="bio" placeholder={userProfile.bio}></input>
        <br />
        <button onClick={() => handleEditClick()}>Submit edits</button>
      </>
    );
  };

  if (!writeContracts || !writeContracts.TinderChain) return <div>Still loading</div>;
  return userProfile === null ? createProfilePage() : editProfilePage();
}
