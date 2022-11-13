// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";


contract TheCensorshipGame is Ownable {
  uint256 constant private M1 = 0x0000000000000000000000000000000000000000000000005555555555555555;
  uint256 constant private M2 = 0x0000000000000000000000000000000000000000000000003333333333333333;
  uint256 constant private M4 = 0x0000000000000000000000000000000000000000000000000F0F0F0F0F0F0F0F;
  IERC721 constant ETH_BRNO_NFT = IERC721(0xcA20a3AAF600a873F9F6b5B663Db7B9275f16ce9);
  uint256 constant ROUND_LENGTH = 10 minutes;
  uint256 constant VOTE_BUDGET = 100;
  uint256 immutable public PRIZE_POOL;

  event GameStarted(uint256 startTime, bytes32 random);
  event GameOver(address winner, uint256 winningTeam);
  event PlayerRevealed(address player, uint256 team);
  event PlayerFlipped(address player);
  event EndRound(uint256 round);

  enum TEAM {
    RED,
    BLUE
  }

  struct ScoreListItem {
    address prev;
    uint256 score;
    address next;
  }

  struct Player {
    bytes32 commitment;
    uint64 didVote;
    uint64 didFlip;
    uint64 revealedRole;
    string name;
    bool withdrew;
  }

  uint256 public redTeamCount;
  uint256 public blueTeamCount;
  mapping(address => Player) public playerDetails;
  uint256 public gameStart;
  uint256 public round;
  uint256 public cutOffPoint;
  bytes32 public publicSeed;
  address[] public players;
  string[] public names;


  mapping(address => ScoreListItem) public scoreList;
  uint256 public scoreListLength;
  address constant public scoreListGuard = address(1);
  address public scoreListTail = address(1);
  address public cutOffAddress;
  uint256 public roundVoteCount;
  uint256 public roundTimer;

  constructor() payable {
    PRIZE_POOL = msg.value;
    scoreList[scoreListGuard] = ScoreListItem(address(0), type(uint256).max, address(0));
  }

  function _append(address player) internal {
    scoreList[scoreListTail].next = player;
    scoreList[player] = ScoreListItem(scoreListTail, 0, address(0));
    scoreListTail = player;
    scoreListLength++;
  }

  function _remove(address player) internal {
    scoreList[scoreList[player].next].prev = scoreList[player].prev;
    scoreList[scoreList[player].prev].next = scoreList[player].next;
    if(player == scoreListTail)
      scoreListTail = scoreList[player].prev;
    if(scoreList[player].score > scoreList[cutOffAddress].score)
      cutOffAddress = scoreList[cutOffAddress].next;
    scoreList[player] = ScoreListItem(address(0), 0, address(0));
  }

  function _insert(address player, uint256 score) internal {
    address candidate = scoreListGuard;
    while(true) {
      if(scoreList[player].score >= scoreList[candidate].score) {
        scoreList[player] = ScoreListItem(scoreList[candidate].prev, score, candidate);
        scoreList[scoreList[candidate].prev].next = player;
        scoreList[candidate].prev = player;
        if(scoreList[player].score > scoreList[cutOffAddress].score)
          cutOffAddress = cutOffAddress = scoreList[cutOffAddress].prev;
        if(candidate == scoreListTail)
          scoreListTail = player;
        return;
      }
      candidate = scoreList[candidate].next;
    }
  }

  function _updateScoreList(address player, uint256 score) internal {
    _remove(player);
    _insert(player, score);
  }

  function _getIndex(uint256 index) internal view returns (address) {
    require(index < scoreListLength, "index too long");
    address candidate = scoreListGuard;
    for(uint256 i; i < index + 1; i++) {
      candidate = scoreList[candidate].next;
      if (i == index) return candidate;
    }
  }

  function playersList() external view returns (address[] memory) {
      return players;
  }

  function namesList() external view returns (string[] memory) {
    return names;
  }

  function joinGame(bytes32 commitment, string calldata name) external {
    // require(ETH_BRNO_NFT.balanceOf(msg.sender) > 0);
    require(gameStart == 0);
    require(commitment != bytes32(0));
    require(playerDetails[msg.sender].commitment == bytes32(0));

    _append(msg.sender);
    players.push(msg.sender);
    names.push(name);
    playerDetails[msg.sender] = Player(
      commitment, 0, 0, type(uint64).max, name, false
    );
  }

  function startGame(bytes32 random) external onlyOwner {
    require(gameStart == 0);
    gameStart = block.timestamp;
    roundTimer = block.timestamp;
    publicSeed = random;
    cutOffPoint = scoreListLength - 1;
    cutOffAddress = scoreListTail;
    emit GameStarted(block.timestamp, random);
  }

  function voteToSave(
    address[] calldata saved,
    uint256[] calldata weights,
    bool flip
  ) external notCensored {
    require(gameStart > 0, "GAME NOT STARTED");
    require(round % 2 == 0, "NOT EVEN ROUND");
    require(playerDetails[msg.sender].didVote & 1 << (round/2) == 0, "ALREADY VOTED");
    _validateVote(saved, weights);

    playerDetails[msg.sender].didVote |= uint64(1 << (round/2));

    for(uint256 i; i < saved.length; i++) {
      uint256 score =  uint64(Math.sqrt(10000*weights[i]));
      _updateScoreList(saved[i], scoreList[saved[i]].score + score);
    }

    if(flip) {
      _flip();
    }

    roundVoteCount++;
    if (roundVoteCount == cutOffPoint + 1 || block.timestamp > roundTimer + 10 minutes) {
      _endRound();
    }
  }

  function _flip() internal {
    require(playerDetails[msg.sender].didFlip & 1 << (round/2) == 0, "ALREADY FLIPPED");

    playerDetails[msg.sender].didFlip |= uint64(1 << (round/2));
    emit PlayerFlipped(msg.sender);
  }

  function reveal(bytes32 seed, bytes32 nonce) external {
    require(gameStart > 0, "GAME NOT STARTED");
    require(round % 2 == 1, "NOT REVEAL ROUND");
    bytes32 commit = playerDetails[msg.sender].commitment;
    require(
      commit != bytes32(0) &&
      commit == keccak256(abi.encodePacked(seed,nonce)),
      "INVALID COMMIT"
    );
    require(playerDetails[msg.sender].revealedRole == type(uint64).max, "ALREADY REVEALED");

    uint256 currTeam = _getCurrentTeam(seed, playerDetails[msg.sender].didFlip);
    playerDetails[msg.sender].revealedRole = uint64(currTeam);
    
    roundVoteCount++;
    if (
      block.timestamp > roundTimer + 2 minutes ||
      roundVoteCount == cutOffPoint + 1
    ) {
      if (cutOffPoint == 0) {
        emit GameOver(msg.sender, currTeam);
        return;
      }
      _endRound();
    }
    if (currTeam == 0) {
      redTeamCount++;
    } if (currTeam == 1) {
      blueTeamCount++;
    }

    emit PlayerRevealed(msg.sender, currTeam);
  }

  function claimWinnings() external {
    require(playerDetails[msg.sender].withdrew == false, "ALREADY WITHDREW");
    require(cutOffPoint == 0, "GAME NOT OVER");
    uint256 winningTeam = playerDetails[scoreList[scoreListGuard].next].revealedRole;
    require(winningTeam < 2, "WINNER DIDNT REVEAL");
    require(winningTeam == playerDetails[msg.sender].revealedRole, "NOT A WINNER");

    uint256 amountOfWinners = winningTeam == 0 ? redTeamCount: blueTeamCount;
    playerDetails[msg.sender].withdrew = true;
    (bool success, ) = msg.sender.call{value: PRIZE_POOL/amountOfWinners}("");
    require(success);
  }

  function recover() external onlyOwner {
    require(block.timestamp > gameStart + 1 days);
    msg.sender.call{value: address(this).balance}("");
  }

  function endRound() external onlyOwner {
    _endRound();
  }

  function stillAlive() external view returns (bool) {
    return scoreList[msg.sender].score >= scoreList[cutOffAddress].score;
  }

  function didVote() external view returns (bool) {
    return playerDetails[msg.sender].didVote & 1 << (round/2) > 0;
  }

  function _endRound() internal {
    if (round % 2 == 0) {
      cutOffPoint /= 2;
      cutOffAddress = _getIndex(cutOffPoint);
    }
    round++;
    roundVoteCount = 0;
    roundTimer = block.timestamp;
    emit EndRound(round);
  }

  modifier notCensored() {
    if (round > 0) {
      require(
        scoreList[cutOffAddress].score <=
        scoreList[msg.sender].score
      );
    }
    _;
  }

  function getStartingTeam(bytes32 seed) public view returns (uint256) {
    return uint256(keccak256(abi.encodePacked(seed, publicSeed))) % 2;
  }

  function getMyColor(bytes32 seed) external view returns (uint256) {
      return _getCurrentTeam(seed, playerDetails[msg.sender].didFlip);
  }

  function _getCurrentTeam(bytes32 seed, uint256 didFlip) internal view returns (uint256) {
    if (_popCount(didFlip) % 2 == 0) {
      return getStartingTeam(seed);
    }
    return getStartingTeam(seed) ^ 1;
  }

  function _validateVote(
    address[] calldata saved,
    uint256[] calldata weights
  ) internal view {
    require(saved.length == weights.length);

    uint256 total;
    for (uint256 i; i < weights.length; i++) {
      total += weights[i];
    }
    require(total <= VOTE_BUDGET);

    for(uint256 i; i < saved.length; i++) {
      require(msg.sender != saved[i]);
      if (i > 0) {
        require(uint160(saved[i - 1]) < uint160(saved[i]));
      }
    }
  }

  // only works for uint64
  function _popCount(uint256 x) internal pure returns (uint256 pop_) {
    x -= (x >> 1) & M1;
    x = (x & M2) + ((x >> 2) & M2);
    x = (x + (x >> 4)) & M4;
    x += x >>  8;
    x += x >> 16;
    x += x >> 32;
    return x & 0x7f;
  }
}