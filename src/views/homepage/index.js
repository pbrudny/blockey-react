import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import api from 'root/api';
import { ToastContainer, toast } from 'react-toastify';
import { Grid, Column, Icon } from 'semantic-ui-react';
import { Input, Button, Image } from 'semantic-ui-react'
import KYCValidations from '../../../src/contracts/build/KYCValidations.json';
import logo from '../../common/images/BlocKey.png';

import "./index.scss";

class TradesView extends Component {

  state = {
    wallet: '',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@gmail.com',
    identificationNumber: '84010902434',
    token: '',
    message: ''
  };

  componentDidMount() {
    const contract = require('truffle-contract');
    if(window.web3 !== undefined) {
      const contract1 = window.web3.eth.contract(KYCValidations['abi']).at('0xcDF29525B1b81ea064F123c5524737eAbB5547ed');
      contract1.checkPendingOwnership(
        '0x36709CeE9518d70376e82aD569930941aE3f5479',
        '0x989acdd1d5ae470c92967e0f57f2c2b9296b6ca2c4a50b522e2670cc76642159',
         (err, res) => {
          console.log('err', err);
          console.log('result', res);
        });

      if(window.web3.eth.accounts.length > 0) {
        // this.setState({'wallet': window.web3.eth.accounts[0]});
      }
    } else {
      alert('Launch MetaMask!');
    }
  }

  bankLogin = () => {

    this.setState({message: 'Fetching your bank token.'});
    setTimeout(()=> {
      this.setState({message: 'Token ready. Submit your data for review'})
    }, 5000);
    api.loginPSD2Bank().then((res) => {
      const token = res.data.token;

      this.setState({token});
    });
  }
  submit = () => {

    this.setState({message: 'Data submitted. Please wait for verification...'});
    const hash = window.web3.sha3(
      this.state.first_name + this.state.last_name + this.state.email + this.state.identificationNumber
    );

    const data = {
      'token': this.state.token,
      'hashed_data': hash,
      'wallet': this.state.wallet
    };

    api.ValidatePost(data).then((res) => {
      console.log('res',res.data.result);
      if(res.data.result === "Yes") {
        this.setState({message: 'Data verified by bank. Please confirm your wallet by sending MetaMask transaction'});
      }
      if(res.data.result === "No") {
        this.setState({message: 'Data not verified by your bank. Your data may differ.'});
      }
    });
  };

  render() {
    return (
      <div className="homepage-content">
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column width={8} mobile={16}>
              <div className="box main-box">
              <Image src={logo} />
                <p>Enter your wallet address and your personal data, to assign this wallet to your identity.</p>
                <br/>
                <div className="main-form">
                  <Input placeholder='Eth wallet address (0x...)'  /><br/>
                  <Input placeholder='First name' value={this.state.first_name} /><br/>
                  <Input placeholder='Last name' value={this.state.last_name} /><br/>
                  <Input placeholder='Email' value={this.state.email} /><br/>
                  <Input placeholder='Identification number' value={this.state.identificationNumber} /><br/>
                  {
                    this.state.message && <div className="messagebox">{this.state.message}</div>
                  }
                  <div className="actions">
                    <Button className="submit-button" onClick={this.submit}>Submit</Button>
                  </div>
                  <div className="actions">
                    <Button className="submit-button" onClick={this.bankLogin}>Bank login</Button>
                  </div>
                </div>
                <br/>
                <br/>
                <br/>
              </div>
            </Grid.Column>
            <Grid.Column width={8} mobile={16}>

            </Grid.Column>
          </Grid.Row>
        </Grid>

        <ToastContainer autoClose={20000} />
      </div>
    )
  }
}

export default withRouter(TradesView);