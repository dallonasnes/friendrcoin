import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance, Events } from "../components";
const { ethers } = require("ethers");

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
    const handleCreateClick = () => {
      const _image1 = document.getElementById("image1").value;
      if (!isValidHTTPUrl(_image1)) {
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
      setBio(_bio);
      try {
        faucetTx({
          to: address,
          value: ethers.utils.parseEther("0.01"),
        });
        faucetTx(writeContracts.TinderChain.createUserProfileFlow(address, _name, _image1, "", "", _bio));
        setUserProfile({ address, name: _name, images: [_image1, "", ""], bio: _bio });
        // setTimeout(() => window.location.reload(), 300)
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
            faucetTx(writeContracts.TinderChain.editProfileImageAtIndex(address, 0, _image1));
            setUserProfile({ ...userProfile, images: [_image1, userProfile.images[1], userProfile.images[2]] });
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
          faucetTx(writeContracts.TinderChain.editProfileName(address, _name));
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
          faucetTx(writeContracts.TinderChain.editProfileName(address, _bio));
          setUserProfile({ ...userProfile, bio: _bio });
        } catch (e) {
          console.log(e);
        }
      }
    };

    return (
      <>
        <h2>Here you can edit your profile</h2>
        <label>Name</label>
        <input id="name" placeholder={name || userProfile.name}></input>
        <br />
        <img alt="your image link doesn't work :(" src={image1 || userProfile.images[0]} />
        <br />
        <label>HTTP URL to profile image</label>
        <input id="image1" placeholder={image1 || userProfile.images[0]}></input>
        <br />
        <label>Bio</label>
        <input id="bio" placeholder={bio || userProfile.bio}></input>
        <br />
        <button onClick={() => handleEditClick()}>Submit edits</button>
      </>
    );
  };

  if (!writeContracts || !writeContracts.TinderChain) return <div>Still loading</div>;
  return userProfile === null ? createProfilePage() : editProfilePage();
}
