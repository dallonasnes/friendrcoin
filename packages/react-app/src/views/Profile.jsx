import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance, Events } from "../components";
const { ethers } = require("ethers");

const setNickname = ({ nickname }) => {
  // TODO: write this
  return true;
};

/**
 * 
 * 
      
      <div style={{ display: "inline-block", margin: "5px", marginBottom: "10px" }}>
        <img alt="Profile avatar" src={"../../profileAvatar.svg"} />
        <div style={{ display: "inline-block", margin: "5px" }}>
          <BoxH2 style={{ margin: "5px" }}>Hello: {userProfile ? userProfile.name : "TEMP NAME"}</BoxH2>
          <div style={{ margin: "5px" }}>Your Balance: 10</div>
        </div>
        <div style={{ display: "inline-block", marginLeft: "500px", marginRight: "5px" }}>
          <Button style={{ display: "vertical-align" }}>Explore messages </Button>
        </div>
      </div>
 */

// TODO: debug this
const isValidHTTPUrl = ({ input }) => {
  return true;
  let url;
  try {
    url = new URL(input);
  } catch (e) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

export default function Profile({ address, userProfile, setUserProfile, faucetTx, tx, writeContracts }) {
  const createProfilePage = () => {
    const [name, setName] = useState(null);
    const [image1, setImage1] = useState(null);
    const [bio, setBio] = useState(null);

    const handleCreateClick = () => {
      const _image1 = document.getElementById("image1").value;
      if (!isValidHTTPUrl(_image1)) {
        alert("Image input is not a valid url. Please try again");
        return;
      }
      setImage1(_image1);
      const _name = document.getElementById("name").value;
      if (!_name || _name === "") {
        alert("Empty name input");
        return;
      }
      setName(_name);
      const _bio = document.getElementById("bio").value;
      if (!_bio || _bio === "") {
        alert("Empty bio input");
        return;
      }
      setBio(_bio);
      try {
        faucetTx({
          to: address,
          value: ethers.utils.parseEther("0.01"),
        });
        tx(writeContracts.TinderChain.createUserProfileFlow(address, _name, _image1, "", "", _bio));
        // Refresh page so it loads knowing that client has a profile now
        setUserProfile({ address, name: _name, image1: _image1, image2: "", image3: "", bio: _bio });
        setTimeout(() => window.location.reload(), 300)
      } catch (e) {
        console.log(e);
      }
    };

    return (
      <>
        <h2>You must create a profile to swipe</h2>
        <label>Name</label>
        <input id="name"></input>
        <br />
        <label>HTTP URL to profile image</label>
        <input id="image1"></input>
        <br />
        <label>Bio</label>
        <input id="bio"></input>
        <br />
        <button onClick={() => handleCreateClick()}>Submit</button>
      </>
    );
  };

  const editProfilePage = () => {
    const [name, setName] = useState(userProfile.name);
    const [image1, setImage1] = useState(userProfile.images[0]);
    const [bio, setBio] = useState(userProfile.bio);

    const handleEditClick = () => {
      const _image1 = document.getElementById("image1").value;
      if (_image1 !== "" && _image1 != image1) {
        if (!isValidHTTPUrl(_image1)) {
          alert("Image input is not a valid url. Please try again");
          return;
        } else {
          try {
            faucetTx({
              to: address,
              value: ethers.utils.parseEther("0.01"),
            });
            tx(writeContracts.TinderChain.editProfileImageAtIndex(address, 0, _image1));
            setImage1(_image1);
            setUserProfile({ ...userProfile, image1: _image1 });
          } catch (e) {
            console.log(e);
          }
        }
      }

      const _name = document.getElementById("name").value;
      if (_name && _name !== name && _name === "") {
        try {
          faucetTx({
            to: address,
            value: ethers.utils.parseEther("0.01"),
          });
          tx(writeContracts.TinderChain.editProfileName(address, _name));
          setName(_name);
          setUserProfile({ ...userProfile, name: _name });
        } catch (e) {
          console.log(e);
        }
      }
      const _bio = document.getElementById("bio").value;
      if (_bio && _bio !== bio && _bio === "") {
        try {
          faucetTx({
            to: address,
            value: ethers.utils.parseEther("0.01"),
          });
          tx(writeContracts.TinderChain.editProfileName(address, _bio));
          setBio(_bio);
          setUserProfile({ ...userProfile, bio: _bio });
        } catch (e) {
          console.log(e);
        }
      }
      setTimeout(() => window.location.reload(), 300)
    };

    return (
      <>
      <h2>Here you can edit your profile</h2>
        <label>Name</label>
        <input id="name" value={name || userProfile.name}></input>
        <br />
        <img alt="your image" src={image1 || userProfile.images[0]} />
        <br />
        <label>HTTP URL to profile image</label>
        <input id="image1" value={image1 || userProfile.images[0]}></input>
        <br />
        <label>Bio</label>
        <input id="bio" value={bio || userProfile.bio}></input>
        <br />
        <button onClick={() => handleEditClick()}>Submit edits</button>
      </>
    );
  };

  if (!writeContracts || !writeContracts.TinderChain) return <div>Still loading</div>;
  return userProfile === null ? createProfilePage() : editProfilePage();
}
