import React from "react";
import { DEBUG_TRANSACTIONS } from "../constants";
const { ethers } = require("ethers");

const imageTypes = ["jpg", "jpeg", "png", "gif"];
const isValidHTTPUrl = input => {
  return true;
  try {
    debugger;
    const url = new URL(input);
    // TODO: now that this is being reused, do we still want to check if the input includes a image file type
    return true; // && imageTypes.some(el => input.toLowerCase().includes(el));
  } catch (e) {
    return false;
  }
};

export default function Profile({ isLoggedIn, address, userProfile, setUserProfile, tx, writeContracts }) {
  const createProfilePage = () => {
    const handleCreateClick = () => {
      const _image = document.getElementById("image").value.trim();
      if (!_image) {
        // for now no requirement to upload an image
        // alert("plz upload an image");
        // return;
      } else if (!isValidHTTPUrl(_image)) {
        alert("Image input is not a valid url. Please try again");
        return;
      }
      let _socialProfile = document.getElementById("socialProfile").value.trim();
      if (!_socialProfile) {
        alert("plz link to your social media profile");
        return;
      } else if (!isValidHTTPUrl(_socialProfile)) {
        alert("Social media link is not a valid url. Please try again");
        return;
      } else {
        // _socialProfile = new URL(_socialProfile);
      }

      const _name = document.getElementById("name").value.trim();
      if (!_name || _name === "") {
        alert("Empty name input");
        return;
      }
      const _bio = document.getElementById("bio").value.trim();
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
          tx(writeContracts.TinderChain.createUserProfileFlow(address, _name, _image, _bio, _socialProfile));
        } catch (e) {
          console.log(e);
        }
      }
      // always set the profile, so it's just in state for burner mode
      setUserProfile({
        address,
        name: _name,
        image: _image,
        bio: _bio,
        socialMediaProfile: _socialProfile,
      });
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
        <label>URL to an avatar image</label>
        <input type="text" id="image"></input>
        <br />
        <label>URL to a social media profile</label>
        <input type="text" id="socialProfile"></input>
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
      let didimageChange = false;
      let didSocialProfileChange = false;
      const _image = document.getElementById("image").value.trim();
      if (_image !== "" && _image != userProfile.image) {
        if (!isValidHTTPUrl(_image)) {
          alert("Image input is not a valid url. Please try again");
          return;
        } else {
          didimageChange = true;
        }
      }
      let _socialProfile = document.getElementById("socialProfile").value.trim();
      if (!_socialProfile || _socialProfile === userProfile.socialProfile) {
        // do nothing if they don't update social profile
      } else if (!isValidHTTPUrl(_socialProfile)) {
        alert("Social media link is not a valid url. Please try again");
        return;
      } else {
        // _socialProfile = new URL(_socialProfile);
        didSocialProfileChange = true;
      }

      const _name = document.getElementById("name").value.trim();
      if (_name && _name !== userProfile.name && _name !== "") {
        didNameChange = true;
      }
      const _bio = document.getElementById("bio").value.trim();
      if (_bio && _bio !== userProfile.bio && _bio !== "") {
        didBioChange = true;
      }

      if (didNameChange || didBioChange || didimageChange || didSocialProfileChange) {
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
                didimageChange,
                _image,
                didBioChange,
                _bio,
                didSocialProfileChange,
                _socialProfile,
              ),
            );
          } catch (e) {
            console.log(e);
          }
        }

        const updatedName = didNameChange ? _name : userProfile.name;
        const updatedImage = didimageChange ? _image : userProfile.image;
        const updatedBio = didBioChange ? _bio : userProfile.bio;
        const updatedSocialMediaLink = didSocialProfileChange ? _socialProfile : userProfile.socialMediaProfile;
        setUserProfile({
          ...userProfile,
          name: updatedName,
          bio: updatedBio,
          image: updatedImage,
          socialMediaProfile: updatedSocialMediaLink,
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
        <br />
        <label>URL to an avatar image</label>
        <input type="text" id="image" placeholder={userProfile.image}></input>
        <img src={userProfile.image} style={{ "border-radius": "50%" }}></img>
        <br />
        <label>URL to a social media profile</label>
        <input type="text" id="socialProfile" placeholder={userProfile.socialMediaProfile}></input>
        <br />
        <button onClick={() => setTimeout(window.open("//" + userProfile.socialMediaProfile, "_blank"), 1000)}>
          Social Media Profile
        </button>
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
