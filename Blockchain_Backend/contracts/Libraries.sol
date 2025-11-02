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

    

    function makePlayerFreeAgent(Structs.Player storage _player) internal {
        _player.teamName = FREE_AGENT;
        _player.isFreeAgent = true;
        _player.contractExpires = 0;
    }

   
}