pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./FriendrCoin.sol";

contract FriendrChain is OwnableUpgradeable {
    event messageSent(address sender, address receiver, uint256 messageIdx);
    event publicMessageSent(address sender, uint256 publicMessageIdx);
    event messageVoted(uint256 publicMessageIdx, bool isUpvote);
    event swipeMatch(address swiper, address swipee);

    struct Profile {
        string name;
        address _address;
        string image;
        string bio;
        string socialMediaProfile;
        uint256 created_ts;
        uint256 deleted_ts;
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
        uint256 upvotes;
        uint256 downvotes;
        address author;
        string authorImg;
        uint256 idx;
    }

    modifier onlySenderOrOwner(address _profile) {
        require(
            _profile == _msgSender() || owner() == _msgSender(),
            "Caller is neither the target address nor owner nor proxy admin."
        );
        _;
    }

    mapping(address => Profile) private _profiles; // profile for an address
    mapping(address => mapping(address => bool)) private _swipedAddresses; // addresses swiped on by address (value indexed by address for lookup)
    mapping(address => mapping(address => bool)) private _swipedRightAddresses; // addresses swiped right on by address (value indexed by address for lookup)
    mapping(address => mapping(uint256 => address)) private _matches; // addresses matched by address
    mapping(address => uint256) private _matches_count; // number of matches by address used for indexed match lookup
    mapping(bytes => mapping(uint256 => Message)) private _messages; // message history by address pair packed into bytes using map for lookups
    mapping(bytes => uint256) private _messages_count; // count of messages by message pair used for lookups in _messages
    mapping(uint256 => address) private _accounts; // indexed list of all accounts in the contract
    mapping(uint256 => PublicMessage) private _public_messages; // indexed list of public messages
    mapping(address => mapping(uint256 => bool)) _votes_cast_by_user; // tracking which public messages a user has already voted on

    FriendrCoin private friendrCoin; // note that coins are issued in wei, so we need to multiply all by (10 ** 18)

    uint256 private initTokenReward;
    uint256 private defaultApprovalAmt;
    string public defaultMessageText;

    uint256 public profileCount;
    uint256 public publicMessageCount;

    uint256 private constant oneHundredMillion = 1000 * 1000 * 1000 * (10**18); // need to multiply it into wei
    uint256 private constant twentyMillion = oneHundredMillion / 5;
    uint256 private constant eightyMillion = twentyMillion * 4;

    function initialize() external initializer {
        __Ownable_init();
        // mint 20% to deployer and the rest to the contract
        friendrCoin = new FriendrCoin(
            "FriendrCOIN",
            "FRIEND",
            twentyMillion,
            eightyMillion,
            owner(),
            address(this)
        );
        profileCount = 0; // Init to 0
        publicMessageCount = 0; // Init to 0
        initTokenReward = 100 * (10**18);
        defaultApprovalAmt = 10000000 * (10**18);
        defaultMessageText = "This is the beginning of your message history.";
    }

    /**
     * Public Read APIs
     */

    // Used by FE login flow to determine if wallet user has already created a profile
    // If Profile object created_ts == 0, then it is a default profile (not yet created)
    function getUserProfile(address _profile)
        public
        view
        returns (Profile memory)
    {
        Profile storage profile = _profiles[_profile];
        if (profile.deleted_ts != 0) {
            // return the 0 address which we define to be nil
            return _profiles[address(0)];
        }
        return profile;
    }

    function getUnseenProfiles(
        address _profile,
        uint256 limit,
        uint256 offset,
        bool isBurner
    ) public view returns (Profile[] memory, uint256, uint256) {
        require(
            offset < profileCount,
            "Cannot fetch profiles indexed beyond those that exist in system"
        );
        uint256 profileRtnCount = 0;
        uint256 ownTokenBalanceTier = getTokenTier(getTokenBalanceOfUser(_profile));
            
        Profile[] memory profiles = new Profile[](limit);

        uint256 missedProfiles = 0;

        while (profileRtnCount < limit && offset < profileCount) {
            // get account at index offset
            
            address currAcct = _accounts[offset];
            // skip if _profile is the same as currAct
            if (_profile != currAcct) {
                // see if currAcct was already swiped by _profile
                // but if caller is burner wallet then we don't need to do profile lookup
                bool alreadySwiped = isBurner
                    ? false
                    : _swipedAddresses[_profile][currAcct];
                if (!alreadySwiped) {
                    uint256 counterpartyTokenBalance = getTokenBalanceOfUser(currAcct);
                    if (getTokenTier(counterpartyTokenBalance) <= ownTokenBalanceTier)
                    {
                         // get profile for currAcct
                        Profile memory profToShowInQueue = _profiles[currAcct];
                        // if profToShowInQueue is not deleted, then add it to rtnList
                        if (profToShowInQueue.deleted_ts == 0) {
                            profiles[profileRtnCount] = profToShowInQueue;
                            profileRtnCount++;
                        }
                    }
                    else
                    {
                        missedProfiles++;
                    }
                }
            }

            offset++;
        }

        // we want to return an array of the exact correct size
        Profile[] memory profilesToRtn = new Profile[](profileRtnCount);
        for (uint256 i = 0; i < profileRtnCount; i++) {
            profilesToRtn[i] = profiles[i];
        }

        return (profilesToRtn, offset, missedProfiles);
    }

    function getIsMatch(address swiper, address swipee)
        public
        view
        returns (bool)
    {
        return
            _swipedRightAddresses[swiper][swipee] &&
            _swipedRightAddresses[swipee][swiper];
    }

    // This endpoint serves the messages loading page to see all people with whom there were recent messages
    // It returns profiles to display on the page that a user can click into to see message history
    // As well as a new offset for pagination purposes
    // TODO: modify this to return most recent page of conversations
    function getRecentMatches(
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
        Profile[] memory profiles = new Profile[](limit);

        while (profileRtnCount < limit && offset < matchesCount) {
            address _match = _matches[_profile][offset];
            Profile memory _match_profile = _profiles[_match];
            if (_match_profile.deleted_ts == 0) {
                profiles[profileRtnCount] = _match_profile;
                profileRtnCount++;
            }
            offset++;
        }

        // we want to return an array of the exact correct size
        Profile[] memory profilesToRtn = new Profile[](profileRtnCount);
        for (uint256 i = 0; i < profileRtnCount; i++) {
            profilesToRtn[i] = profiles[i];
        }

        return (profilesToRtn, offset);
    }

    // Called when user clicks into a conversation with a match
    function getRecentMessagesForMatch(
        address _address1,
        address _address2,
        uint256 limit,
        uint256 offset
    ) public view returns (Message[] memory, uint256) {
        require(
            _address1 != _address2,
            "Cannot send/receive messages to/from self."
        );
        // Note that matchKeyPair can be address1:address2 or address2:address1 depending on order of creation
        // So need to try other order pair if first try returns 0 matches (all matches have at least 1 match bc of default match)
        bytes memory matchKeyPair = fetchMessageKeyPair(_address1, _address2);
        uint256 messageCount = _messages_count[matchKeyPair];

        require(
            offset < messageCount,
            "Cannot read messages indexed beyond total number of messages for this pair"
        );

        Message[] memory messages = new Message[](limit);
        uint256 messagesToRtnCount = 0;
        while (messagesToRtnCount < limit && offset < messageCount) {
            Message memory message = _messages[matchKeyPair][offset];
            if (message.deleted_ts == 0) {
                messages[messagesToRtnCount] = message;
                messagesToRtnCount++;
            }
            offset++;
        }

        // we want to return an array of the exact correct size
        Message[] memory messagesToRtn = new Message[](messagesToRtnCount);
        for (uint256 i = 0; i < messagesToRtnCount; i++) {
            messagesToRtn[i] = messages[i];
        }

        return (messagesToRtn, offset);
    }

    // Called on public message dashboard load
    // TODO: figure out how to sort these by vote
    function getPublicMessages(uint256 limit, uint256 offset)
        public
        view
        returns (PublicMessage[] memory, uint256)
    {
        require(
            offset < publicMessageCount,
            "Cannot read public messages indexed beyond total number of public messages that exist"
        );

        PublicMessage[] memory messages = new PublicMessage[](limit);
        uint256 messagesToRtnCount = 0;
        while (messagesToRtnCount < limit && offset < publicMessageCount) {
            PublicMessage memory message = _public_messages[offset];
            messages[messagesToRtnCount] = message;
            messagesToRtnCount++;
            offset++;
        }

        // we want to return an array of the exact correct size
        PublicMessage[] memory messagesToRtn = new PublicMessage[](
            messagesToRtnCount
        );
        for (uint256 i = 0; i < messagesToRtnCount; i++) {
            messagesToRtn[i] = messages[i];
        }

        return (messagesToRtn, offset);
    }

    // Gets balance of token for given wallet
    function getTokenBalanceOfUser(address _profile)
        public
        view
        returns (uint256)
    {
        return friendrCoin.balanceOf(_profile);
    }

    // Gets wallet address of FriendrCoin
    function getTokenAddress() public view returns (address) {
        return address(friendrCoin);
    }

    /**
     * Public Write APIs
     */

    function createUserProfileFlow(
        address _profile,
        string memory name,
        string memory _image,
        string memory bio,
        string memory _socialMediaProfile
    ) public {
        require(
            _profile != address(0),
            "Cannot create a profile at the 0 address"
        );
        // This function adds tokens to the profile upon creation
        // So require that a profile cannot already exist for the given address
        // Use updateUserProfile method to update existing profile (it does not pay tokens)
        Profile storage profile = _profiles[_profile];
        if (profile.deleted_ts != 0) {
            // calling create for a deleted profile means to re-activate it
            profile.deleted_ts = 0;
        } else {
            // if the profile is not deleted, then we ensure it doesn't already exist
            require(
                profile.created_ts == 0,
                "Cannot create a profile that already exists."
            );
        }

        profile.name = name;
        profile._address = _profile;
        profile.image = _image;
        profile.bio = bio;
        profile.socialMediaProfile = _socialMediaProfile;
        profile.created_ts = block.timestamp;

        // Add profile to indexed list of accounts and increment counter
        _accounts[profileCount] = _profile;
        profileCount++;

        // Approve this contract to spend tokens for _profile's wallet
        friendrCoin.approveFor(_profile, defaultApprovalAmt);

        // Now send tokens from this contract's wallet to _profile's wallet
        // Be sure that we only transfer after setting profile.created_ts because otherwise vulnerable to reentrancy attack
        friendrCoin.transferFrom(address(this), _profile, initTokenReward);
    }

    function swipeLeft(address _userProfile, address _swipedProfile) public {
        _swipedAddresses[_userProfile][_swipedProfile] = true;
    }

    function swipeRight(address _userProfile, address _swipedProfile) public {
        require(
            friendrCoin.balanceOf(_userProfile) > 0,
            "User doesn't have enough tokens to swipe right"
        );
        _swipedAddresses[_userProfile][_swipedProfile] = true;
        _swipedRightAddresses[_userProfile][_swipedProfile] = true;

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
            friendrCoin.transferFrom(
                address(this),
                _swipedProfile,
                1 * (10**18)
            );

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
            emit swipeMatch(_userProfile, _swipedProfile);
        } else {
            friendrCoin.transferFrom(_userProfile, address(this), 1 * (10**18));
        }
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
                upvotes: 0,
                downvotes: 0,
                author: _sender,
                authorImg: _profiles[_sender].image,
                idx: publicMessageCount
            });
            _public_messages[publicMessageCount] = publicMessage;
            // emit event before incrementing publicMessageCount index so that event points to the most recent message
            emit publicMessageSent(_sender, publicMessageCount);
            publicMessageCount++;
        }
    }

    function voteOnPublicMessage(uint256 publicMessageIdx, bool isUpvote)
        public
    {
        require(
            publicMessageIdx < publicMessageCount,
            "Cannot vote on a message that is beyond bounds of public message list"
        );
        PublicMessage storage message = _public_messages[publicMessageIdx];
        require(
            _msgSender() != message.author || _msgSender() == owner(),
            "Cannot vote on your own message"
        );

        require(
            !didAlreadyVoteOnMessage(_msgSender(), publicMessageIdx) ||
                _msgSender() == owner(),
            "Can only vote on a message once."
        );

        // Now they're voting on this message
        _votes_cast_by_user[_msgSender()][publicMessageIdx] = true;

        if (isUpvote) {
            message.upvotes++;
            friendrCoin.transferFrom(
                address(this),
                message.author,
                1 * (10**18)
            );
        } else {
            if (message.upvotes - message.downvotes > 0) {
                // Can only transfer tokens away from author of publicMessage if vote count is positive
                friendrCoin.transferFrom(
                    message.author,
                    address(this),
                    1 * (10**18)
                );
            }
            message.downvotes++;
        }
        emit messageVoted(publicMessageIdx, isUpvote);
    }

    function editProfile(
        address _profile,
        bool editName,
        string memory newName,
        bool editImage,
        string memory newImage,
        bool editBio,
        string memory newBio,
        bool editSocialMediaProfileLink,
        string memory newSocialMediaProfileLink
    ) public {
        require(
            _profiles[_profile].created_ts > 0,
            "Profile is not yet created"
        );

        if (editSocialMediaProfileLink) {
            _profiles[_profile].socialMediaProfile = newSocialMediaProfileLink;
        }

        if (editName) {
            _profiles[_profile].name = newName;
        }

        if (editImage) {
            _profiles[_profile].image = newImage;
        }

        if (editBio) {
            _profiles[_profile].bio = newBio;
        }
    }

    function deleteProfileImage(address _profile) public {
        require(
            _profiles[_profile].created_ts > 0,
            "Profile is not yet created"
        );
        _profiles[_profile].image = "";
    }

    function deleteProfile(address _profile) public {
        require(
            _profiles[_profile].created_ts > 0,
            "Profile is not yet created"
        );
        _profiles[_profile].deleted_ts = block.timestamp;
    }

    /**
     * Helper methods
     */

    function buildAddressKeyPair(address _userProfile, address _swipedProfile)
        private
        pure
        returns (bytes memory)
    {
        return abi.encodePacked(_userProfile, _swipedProfile);
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

    function didAlreadyVoteOnMessage(address voter, uint256 publicMessageIdx)
        private
        view
        returns (bool)
    {
        return _votes_cast_by_user[voter][publicMessageIdx];
    }


    function getTokenTier(uint256 tokenCount)
        private
        view
        returns (uint256)
    {
        uint256 myTier = 0;
        while (tokenCount != 0)
        {
            tokenCount /= 10;

            myTier++;
        }

        return myTier;
    }
    
    /**
     * Owner-only getters and setters
     */

    function setInitTokenReward(uint256 _newReward) public onlyOwner {
        initTokenReward = _newReward;
    }

    function getInitTokenReward() public view onlyOwner returns (uint256) {
        return initTokenReward;
    }

    function setDefaultApprovalAmt(uint256 _newDefaultApprovalAmt)
        public
        onlyOwner
    {
        defaultApprovalAmt = _newDefaultApprovalAmt;
    }

    function getDefaultApprovalAmt() public view onlyOwner returns (uint256) {
        return defaultApprovalAmt;
    }

    function setDefaultMessageText(string memory _text) public onlyOwner {
        defaultMessageText = _text;
    }
}
