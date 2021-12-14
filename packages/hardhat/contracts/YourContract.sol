pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol";
import "./Token.sol";

contract YourContract {
    event messageSent(address sender, address receiver, uint256 messageIdx);
    event publicMessageSent(address sender, uint256 publicMessageIdx);

    struct Profile {
        string name;
        address _address;
        string[3] images;
        string bio;
        uint256 created_ts;
        uint256 deleted_ts; // TODO: create delete profile endpoint
    }

    struct Message {
        string text;
        address sender;
        bool isPublic;
        uint256 created_ts;
        uint256 deleted_ts; // TODO: is this used? I think we need to store message idx in this struct if we want to be able to delete, so that FE has index number to send to delete API
    }

    struct PublicMessage {
        Message message;
        uint256 votes;
        address author;
        uint256 idx;
    }

    mapping(address => Profile) private _profiles; // profile for an address
    mapping(address => mapping(address => bool)) private _swipedAddresses; // addresses swiped on by address (value indexed by address for lookup)
    mapping(address => mapping(address => bool)) private _swipedRightAddresses; // addresses swiped right on by address (value indexed by address for lookup)
    mapping(address => mapping(uint256 => address)) private _matches; // addresses matched by address
    mapping(address => uint256) private _matches_count; // number of matches by address used for indexed match lookup
    mapping(bytes => mapping(uint256 => Message)) private _messages; // message history by address pair packed into bytes using map for lookups
    mapping(bytes => uint256) private _messages_count; // count of messages by message pair used for lookups in _messages
    mapping(uint256 => address) private _accounts; // indexed list of all accounts in the contract
    uint256 private _accountIdx;
    mapping(uint256 => PublicMessage) private _public_messages; // indexed list of public messages
    uint256 private _publicMessageIdx;

    IERC20 private tinderCoin;

    address public profile;
    uint256 private initTokenReward = 10;
    uint256 private defaultApprovalAmt = 1000;
    string private defaultMessageText =
        "This is the beginning of your message history.";

    constructor() {
        tinderCoin = new Token("TINDERCOIN", "TC", 10000000, address(this));
        // Need to approve this contract's address to transact
        tinderCoin.approve(address(this), 10000000);
        _accountIdx = 0; // Init to 0
        _publicMessageIdx = 0; // Init to 0
    }

    // Used by FE login flow to determine if wallet user has already created a profile
    // If Profile object created_ts == 0, then it is a default profile (not yet created)
    // FE needs to decode image
    // TODO: perhaps store images in CDN and return their URL for performance/gas efficiency
    function getUserProfile(address _profile)
        public
        view
        returns (Profile memory)
    {
        return _profiles[_profile];
    }

    // TODO: how can I assert that this can only be called by the FE that I deploy
    // And not any other methods on chain?
    // Used by FE to
    function createUserProfileFlow(
        address _profile,
        string memory name,
        string memory _image0,
        string memory _image1,
        string memory _image2,
        string memory bio
    ) public {
        // This function adds tokens to the profile upon creation
        // So require that a profile cannot already exist for the given address
        // Use updateUserProfile method to update existing profile (it does not pay tokens)
        require(
            _profiles[_profile].created_ts == 0,
            "Cannot create a profile that already exists."
        );
        // QUESTION - can I access profile by reference and change its fields?
        // Or do i need to overwrite the fields in the mapping?
        // Or can I just create and write a new object
        _profiles[_profile].name = name;
        _profiles[_profile]._address = _profile;
        _profiles[_profile].images[0] = _image0;
        _profiles[_profile].images[1] = _image1;
        _profiles[_profile].images[2] = _image2;
        _profiles[_profile].bio = bio;
        _profiles[_profile].created_ts = block.timestamp;

        // Add profile to indexed list of accounts and increment counter
        _accounts[_accountIdx] = _profile;
        _accountIdx++;

        // Approve this contract to spend tokens for _profile's wallet
        tinderCoin.approve(_profile, defaultApprovalAmt);

        // TODO: do i need to require balance of this address > 10?
        // Now send tokens from this contract's wallet to _profile's wallet
        tinderCoin.transferFrom(address(this), _profile, initTokenReward);
    }

    function getNumberOfProfiles() public view returns (uint256) {
        return _accountIdx;
    }

    function getUnseenProfiles(
        address _profile,
        uint256 limit,
        uint256 offset
    ) public view returns (Profile[] memory, uint256) {
        require(
            offset < _accountIdx,
            "Cannot fetch profiles indexed beyond those that exist in system"
        );
        uint256 profileRtnCount = 0;
        Profile[] memory profilesToRtn = new Profile[](limit);
        while (profileRtnCount < limit && offset < _accountIdx) {
            // get account at index offset
            address currAcct = _accounts[offset];
            // see if currAcct was already swiped by _profile
            bool alreadySwiped = _swipedAddresses[_profile][currAcct];
            if (!alreadySwiped) {
                // get profile for currAcct
                Profile memory profToShowInQueue = _profiles[currAcct];
                // if profToShowInQueue is not deleted, then add it to rtnList
                if (profToShowInQueue.deleted_ts == 0) {
                    profilesToRtn[profileRtnCount] = profToShowInQueue;
                    profileRtnCount++;
                }
            }
            offset++;
        }

        return (profilesToRtn, offset);
    }

    function swipeLeft(address _userProfile, address _swipedProfile) public {
        _swipedAddresses[_userProfile][_swipedProfile] = true;
    }

    function buildAddressKeyPair(address _userProfile, address _swipedProfile)
        private
        pure
        returns (bytes memory)
    {
        return abi.encodePacked(_userProfile, _swipedProfile);
    }

    function swipeRight(address _userProfile, address _swipedProfile)
        public
        returns (bool, bool)
    {
        require(
            tinderCoin.balanceOf(_userProfile) > 0,
            "User doesn't have enough tokens to swipe right"
        );
        _swipedAddresses[_userProfile][_swipedProfile] = true;

        // Performance optimization is to first check if match before transferring
        // That way don't need to transfer and then transfer back in case of match
        bool isMatch = _swipedRightAddresses[_swipedProfile][_userProfile];
        if (isMatch) {
            // get number of matches for both swiper and swipee
            uint256 userMatchCount = _matches_count[_userProfile];
            uint256 swipedMatchCount = _matches_count[_swipedProfile];

            // set swiped profile as Nth match for both swiper and swipee
            _matches[_userProfile][userMatchCount] = _swipedProfile;
            _matches[_swipedProfile][swipedMatchCount] = _userProfile;

            // increment match count for swiper and swipee
            _matches_count[_userProfile]++;
            _matches_count[_swipedProfile]++;

            // Now need to return 1 token back to _swipedProfile since they didn't match initially and were thus charged one token
            tinderCoin.transferFrom(address(this), _swipedProfile, 1);

            // Now need to init default message in messages mapping
            bytes memory messageMapKey = buildAddressKeyPair(
                _userProfile,
                _swipedProfile
            );

            uint256 message_ts = block.timestamp;

            Message memory message = Message({
                text: defaultMessageText,
                sender: address(this), // use contract address as sender of initial message
                isPublic: false,
                created_ts: message_ts,
                deleted_ts: 0
            });

            // set the default message to index 0 and then increment message index
            uint256 messages_idx = _messages_count[messageMapKey];
            _messages[messageMapKey][messages_idx] = message;
            _messages_count[messageMapKey]++;
        } else {
            tinderCoin.transferFrom(_userProfile, address(this), 1);
        }

        // QUESTION: will this line properly reflect the transfer that happens earlier in the function? or does that take some time?
        bool canContinueSwiping = tinderCoin.balanceOf(_userProfile) > 0;
        return (isMatch, canContinueSwiping);
    }

    // This endpoint serves the messages loading page to see all people with whom there were recent messages
    // It returns profiles to display on the page that a user can click into to see message history
    // As well as a new offset for pagination purposes
    // TODO: modify this to return most recent page of conversations
    function fetchRecentMatches(
        address _profile,
        uint256 limit,
        uint256 offset
    ) public view returns (Profile[] memory, uint256) {
        // Fetch a page of matches
        uint256 matchesCount = _matches_count[_profile];
        require(
            offset < matchesCount,
            "Cannot read matches indexed beyond total number of matches for this user"
        );

        uint256 profileRtnCount = 0;
        Profile[] memory profilesToRtn = new Profile[](limit);

        while (profileRtnCount < limit && offset < matchesCount) {
            address _match = _matches[_profile][offset];
            Profile memory _match_profile = _profiles[_match];
            if (_match_profile.deleted_ts == 0) {
                profilesToRtn[profileRtnCount] = _match_profile;
                profileRtnCount++;
            }
            offset++;
        }

        return (profilesToRtn, offset);
    }

    // Helper method to determine correct ordering of address1:address2 vs address2:address1 for storing messages
    function fetchMessageKeyPair(address _address1, address _address2)
        private
        view
        returns (bytes memory)
    {
        bytes memory matchKeyPair = buildAddressKeyPair(_address1, _address2);
        uint256 messageCount = _messages_count[matchKeyPair];
        if (messageCount == 0) {
            // Try other pair ordering
            matchKeyPair = buildAddressKeyPair(_address2, _address1);
            messageCount = _messages_count[matchKeyPair];
            // If message count is still 0, then we have an issue
            require(
                messageCount > 0,
                "Profile pair doesn't have any messages, perhaps match was never initialized"
            );
        }
        return matchKeyPair;
    }

    // Called when user clicks into a conversation with a match
    function fetchRecentMessagesForMatch(
        address _address1,
        address _address2,
        uint256 limit,
        uint256 offset
    ) public view returns (Message[] memory, uint256) {
        // Note that matchKeyPair can be address1:address2 or address2:address1 depending on order of creation
        // So need to try other order pair if first try returns 0 matches (all matches have at least 1 match bc of default match)
        bytes memory matchKeyPair = fetchMessageKeyPair(_address1, _address2);
        uint256 messageCount = _messages_count[matchKeyPair];

        require(
            offset < messageCount,
            "Cannot read messages indexed beyond total number of messages for this pair"
        );

        Message[] memory messagesToRtn = new Message[](limit);
        uint256 messagesToRtnCount = 0;
        while (messagesToRtnCount < limit && offset < messageCount) {
            Message memory message = _messages[matchKeyPair][offset];
            if (message.deleted_ts == 0) {
                messagesToRtn[messagesToRtnCount] = message;
                messagesToRtnCount++;
            }
            offset++;
        }

        return (messagesToRtn, offset);
    }

    function sendMessage(
        address _sender,
        address _receiver,
        string memory _text,
        bool _isPublic
    ) public {
        bytes memory matchKeyPair = fetchMessageKeyPair(_sender, _receiver);
        uint256 messageCount = _messages_count[matchKeyPair];

        // now add message to end of message history for the pair and increment counter
        Message memory message = Message({
            text: _text,
            sender: _sender,
            isPublic: _isPublic,
            created_ts: block.timestamp,
            deleted_ts: 0
        });
        _messages[matchKeyPair][messageCount] = message;
        // emit event before incrementing messageCount index so that event points to the most recent message
        emit messageSent(_sender, _receiver, messageCount);
        _messages_count[matchKeyPair]++;

        // if message is public, add it to indexed mapping of public messages
        if (_isPublic) {
            PublicMessage memory publicMessage = PublicMessage({
                message: message,
                votes: 0,
                author: _sender,
                idx: _publicMessageIdx
            });
            _public_messages[_publicMessageIdx] = publicMessage;
            // emit event before incrementing _publicMessageIdx index so that event points to the most recent message
            emit publicMessageSent(_sender, _publicMessageIdx);
            _publicMessageIdx++;
        }
    }

    // Called on public message dashboard load
    // TODO: figure out how to sort these by vote
    function fetchPublicMessages(uint256 limit, uint256 offset)
        public
        view
        returns (PublicMessage[] memory, uint256)
    {
        require(
            offset < _publicMessageIdx,
            "Cannot read public messages indexed beyond total number of public messages that exist"
        );

        PublicMessage[] memory messagesToRtn = new PublicMessage[](limit);
        uint256 messagesToRtnCount = 0;
        while (messagesToRtnCount < limit && offset < _publicMessageIdx) {
            PublicMessage memory message = _public_messages[offset];
            messagesToRtn[messagesToRtnCount] = message;
            messagesToRtnCount++;
            offset++;
        }

        return (messagesToRtn, offset);
    }

    function voteOnPublicMessage(uint256 publicMessageIdx, bool isUpvote)
        public
    {
        require(
            publicMessageIdx < _publicMessageIdx,
            "Cannot vote on a message that is beyond bounds of public message list"
        );
        if (isUpvote) {
            _public_messages[publicMessageIdx].votes++;
            tinderCoin.transferFrom(
                address(this),
                _public_messages[publicMessageIdx].author,
                1
            );
        } else {
            if (_public_messages[publicMessageIdx].votes > 0) {
                // Can only transfer tokens away from author of publicMessage if vote count is positive
                tinderCoin.transferFrom(
                    _public_messages[publicMessageIdx].author,
                    address(this),
                    1
                );
            }
            _public_messages[publicMessageIdx].votes--;
        }
    }

    function editProfileImageAtIndex(
        address _profile,
        uint256 _index,
        string memory _image
    ) public {
        require(
            _profiles[_profile].created_ts > 0,
            "Profile is not yet created"
        );
        require(
            _index <= 2,
            "Cannot edit image array at index that doesn't exist"
        );
        _profiles[_profile].images[_index] = _image;
    }

    function deleteProfileImageAtIndex(address _profile, uint256 _index)
        public
    {
        require(
            _profiles[_profile].created_ts > 0,
            "Profile is not yet created"
        );
        require(
            _index <= 2,
            "Cannot edit image array at index that doesn't exist"
        );
        _profiles[_profile].images[_index] = "";
    }

    function editProfileBio(address _profile, string memory _bio) public {
        require(
            _profiles[_profile].created_ts > 0,
            "Profile is not yet created"
        );
        _profiles[_profile].bio = _bio;
    }

    function editProfilename(address _profile, string memory _name) public {
        require(
            _profiles[_profile].created_ts > 0,
            "Profile is not yet created"
        );
        _profiles[_profile].name = _name;
    }

    // Gets balance of token for given wallet
    function getTokenBalanceOfUser(address _profile)
        public
        view
        returns (uint256)
    {
        return tinderCoin.balanceOf(_profile);
    }

    // TODO: how do I make sure this can only be set by me?
    // Do I use the contract's address to call this? (how can I use the contract's address?)
    // Or do I add my personal wallet to allow list?
    function setInitTokenReward(uint256 _newReward) public {
        initTokenReward = _newReward;
    }

    // TODO: access control
    // TODO: do I need a getter here? or is it auto-gen'd?
    function getInitTokenReward() public view returns (uint256) {
        return initTokenReward;
    }

    // TODO: access control
    function setDefaultApprovalAmt(uint256 _newDefaultApprovalAmt) public {
        defaultApprovalAmt = _newDefaultApprovalAmt;
    }

    // TODO: access control
    function getDefaultApprovalAmt() public view returns (uint256) {
        return defaultApprovalAmt;
    }

    // TODO: access control
    function setDefaultMessageText(string memory _text) public {
        defaultMessageText = _text;
    }

    // TODO: access control
    function getDefaultMessageText() public view returns (string memory) {
        return defaultMessageText;
    }

    // TODO: access control
    function getNumberOfPublicMessage() public view returns (uint256) {
        return _publicMessageIdx;
    }
}
