/* Copyright (C) 2021 Soteria.fund

  This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

  This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
    along with this program.  If not, see http://www.gnu.org/licenses/ */

pragma solidity ^0.5.0;


interface ITokenController {

  function addToWhitelist(address _member) external;

  function burnLockedTokens(address _of, bytes32 _reason, uint256 _amount) external;

  function mint(address _member, uint256 _amount) external;

  function operatorTransfer(address _from, address _to, uint _value) external returns (bool);

  function releaseLockedTokens(address _of, bytes32 _reason, uint256 _amount) external;

  function tokensLocked(address _of, bytes32 _reason) external view returns (uint256);
}
