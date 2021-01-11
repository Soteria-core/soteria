pragma solidity 0.5.7;

contract QuotationMock {

  address authQuoteEngine;

  constructor(address _authQuoteEngine) public {
    authQuoteEngine = _authQuoteEngine;
  }

  /**
   * @dev Verifies signature.
   * @param coverDetails details related to cover.
   * @param coverPeriod validity of cover.
   * @param smaratCA smarat contract address.
   * @param _v argument from vrs hash.
   * @param _r argument from vrs hash.
   * @param _s argument from vrs hash.
   */
  function verifySign(
    uint[] memory coverDetails,
    uint16 coverPeriod,
    bytes4 curr,
    address smaratCA,
    uint8 _v,
    bytes32 _r,
    bytes32 _s
  )
  public
  view
  returns(bool)
  {
    require(smaratCA != address(0));
    // require(pd.capReached() == 1, "Can not buy cover until cap reached for 1st time");
    bytes32 hash = getOrderHash(coverDetails, coverPeriod, curr, smaratCA);
    return isValidSignature(hash, _v, _r, _s);
  }

  /**
   * @dev Gets order hash for given cover details.
   * @param coverDetails details realted to cover.
   * @param coverPeriod validity of cover.
   * @param smaratCA smarat contract address.
   */
  function getOrderHash(
    uint[] memory coverDetails,
    uint16 coverPeriod,
    bytes4 curr,
    address smaratCA
  )
  public
  view
  returns(bytes32)
  {
    return keccak256(
      abi.encodePacked(
        coverDetails[0],
        curr, coverPeriod,
        smaratCA,
        coverDetails[1],
        coverDetails[2],
        coverDetails[3],
        coverDetails[4],
        address(this)
      )
    );
  }

  /**
   * @dev Verifies signature.
   * @param hash order hash
   * @param v argument from vrs hash.
   * @param r argument from vrs hash.
   * @param s argument from vrs hash.
   */
  function isValidSignature(bytes32 hash, uint8 v, bytes32 r, bytes32 s) public view returns(bool) {
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, hash));
    address a = ecrecover(prefixedHash, v, r, s);
    return (a == authQuoteEngine);
  }
}
