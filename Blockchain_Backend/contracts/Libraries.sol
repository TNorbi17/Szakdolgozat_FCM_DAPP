// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Types.sol";

library TeamLibrary {
    function removePlayerFromTeam(
        Structs.Team storage _team,
        address _playerAddress
    ) internal {
        for (uint i = 0; i < _team.players.length; i++) {
            if (_team.players[i] == _playerAddress) {
                _team.players[i] = _team.players[_team.players.length - 1];
                _team.players.pop();
                break;
            }
        }
    }

    function addPlayerToTeam(
        Structs.Team storage _team,
        address _playerAddress
    ) internal {
        _team.players.push(_playerAddress);
    }

    function hasPlayer(
        Structs.Team storage _team,
        address _playerAddress
    ) internal view returns (bool) {
        for (uint i = 0; i < _team.players.length; i++) {
            if (_team.players[i] == _playerAddress) {
                return true;
            }
        }
        return false;
    }
}

library PlayerLibrary {
    string constant FREE_AGENT = unicode"szabadúszó";

    event PlayerReleased(
        address indexed playerAddress,
        string playerName,
        address indexed oldTeamAddress,
        string oldTeamName
    );

    function updateContractStatus(
        Structs.Player storage _player,
        mapping(string => Structs.Team) storage teamsByName
    ) internal returns (bool) {
        if (
            !_player.isFreeAgent &&
            _player.contractExpires > 0 &&
            block.timestamp >= _player.contractExpires
        ) {
            Structs.Team storage oldTeam = teamsByName[_player.teamName];
            string memory oldTeamName = _player.teamName;
            address oldTeamAddress = oldTeam.walletAddress;

            if (bytes(oldTeam.name).length != 0) {
                TeamLibrary.removePlayerFromTeam(
                    oldTeam,
                    _player.walletAddress
                );
            }

            _player.teamName = FREE_AGENT;
            _player.isFreeAgent = true;
            _player.contractExpires = 0;

            emit PlayerReleased(
                _player.walletAddress,
                _player.name,
                oldTeamAddress,
                oldTeamName
            );

            return true;
        }
        return false;

        
    }

    function makePlayerFreeAgent(Structs.Player storage _player) internal {
        _player.teamName = FREE_AGENT;
        _player.isFreeAgent = true;
        _player.contractExpires = 0;
    }

    function signPlayerToTeam(
        Structs.Player storage _player,
        string memory _teamName,
        uint256 _contractExpires
    ) internal {
        _player.teamName = _teamName;
        _player.isFreeAgent = false;
        _player.contractExpires = _contractExpires;
    }


    function canReleaseFromTeam(
        Structs.Player storage player,
        mapping(address => Structs.Penalty[]) storage playerPenalties
    ) internal view returns (bool) {
        Structs.Penalty[] storage penalties = playerPenalties[player.walletAddress];
        
        for (uint256 i = 0; i < penalties.length; i++) {
            if (!penalties[i].paid) {
                return false;
            }
        }
        
        return true;
    }
}