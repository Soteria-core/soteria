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

pragma solidity 0.5.17;

import "./external/IERC20.sol";
import "./external/ERC20.sol";
import "./external/ERC20Detailed.sol";
import "./external/ERC20Permit.sol";
import "./external/SafeERC20.sol";
import "../../libraries/SafeMath.sol";
import "../../libraries/Math.sol";

contract ISOTE is IERC20 {
    function whiteListed(address owner) external view returns (bool);
    function isLockedForMV(address owner) external view returns (uint256);
}

contract wSOTE is ERC20, ERC20Detailed, ERC20Permit {
    using SafeERC20 for ERC20;
    using SafeMath for uint256;

    ISOTE public SOTE;

    modifier notwSOTE(address recipient) {
        require(recipient != address(this), "wSOTE: can not send to self");
        _;
    }

    constructor(ISOTE _sote) public ERC20Detailed("Wrapped SOTE", "wSOTE", 18) {
        SOTE = _sote;
    }

    function _transfer(address sender, address recipient, uint256 amount)
    internal
    notwSOTE(recipient)
    {
        super._transfer(sender, recipient, amount);
    }

    function wrap(uint256 _amount) external {
        require(SOTE.transferFrom(msg.sender, address(this), _amount), "wSOTE: transferFrom failed");
        _mint(msg.sender, _amount);
    }

    function unwrap(uint256 _amount) external {
        unwrapTo(msg.sender, _amount);
    }

    function unwrapTo(address _to, uint256 _amount) public notwSOTE(_to) {
        _burn(msg.sender, _amount);
        require(SOTE.transfer(_to, _amount), "wSOTE: transfer failed");
    }

    function canWrap(address _owner, uint256 _amount)
    external
    view
    returns (bool success, string memory reason)
    {
        if (SOTE.allowance(_owner, address(this)) < _amount) {
            return (false, "insufficient allowance");
        }

        if (SOTE.balanceOf(_owner) < _amount) {
            return (false, "insufficient SOTE balance");
        }

        if (SOTE.isLockedForMV(_owner) > now) {
            return (false, "SOTE balance lockedForMv");
        }

        if (!SOTE.whiteListed(address(this))) {
            return (false, "wSOTE is not whitelisted");
        }

        return (true, "");
    }

    function canUnwrap(address _owner, address _recipient, uint256 _amount)
    external
    view
    returns (bool success, string memory reason)
    {
        if (balanceOf(_owner) < _amount) {
            return (false, "insufficient wSOTE balance");
        }

        if (!SOTE.whiteListed(_recipient)) {
            return (false, "recipient is not whitelisted");
        }

        if (SOTE.isLockedForMV(address(this)) > now) {
            return (false, "wSOTE is lockedForMv");
        }

        return (true, "");
    }

    /// @dev Method to claim junk and accidentally sent tokens
    function claimTokens(ERC20 _token, address payable _to, uint256 _balance) external {
        require(_to != address(0), "wSOTE: can not send to zero address");

        if (_token == ERC20(address(SOTE))) {
            uint256 surplusBalance = _token.balanceOf(address(this)).sub(totalSupply());
            require(surplusBalance > 0, "wSOTE: there is no accidentally sent SOTE");
            uint256 balance = _balance == 0 ? surplusBalance : Math.min(surplusBalance, _balance);
            _token.safeTransfer(_to, balance);
        } else if (_token == ERC20(0)) {
            // for Ether
            uint256 totalBalance = address(this).balance;
            uint256 balance = _balance == 0 ? totalBalance : Math.min(totalBalance, _balance);
            _to.transfer(balance);
        } else {
            // any other erc20
            uint256 totalBalance = _token.balanceOf(address(this));
            uint256 balance = _balance == 0 ? totalBalance : Math.min(totalBalance, _balance);
            require(balance > 0, "wSOTE: trying to send 0 balance");
            _token.safeTransfer(_to, balance);
        }
    }
}