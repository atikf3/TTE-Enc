
  const stepContent1 = () => {
    return (
      <div>
        Web3, but {' '}<strong>corporate</strong>, get started now!<br />
        <Grid container justifyContent="center">
          {connectWalletButton()}
        </Grid>
      </div>
    )
    }

{/* <header className="App-header">TTE File hanlder with IPFS</header> */}
      {/* <div
        style={{
          height: '1px',
          minHeight: '450px',
          marginTop: '5%',
        }}
      >
        <Stepper
          onComplete={function noRefCheck(){}}
          step={1}
          hasNavButtons={isWeb3Enabled}
          stepData={[
            {
              title: 'Welcome to web3 for corporate',
              content: stepContent1()
            },
            {
              title: 'Learn more',
              content: <div><p>If any button ID = next<br /></p><button id="next">next</button><p>It can be used to navigate<br /></p></div>,
            },
            {
              title: 'Learn more',
              content: <div><p>If any button ID = prev<br /></p><button id="prev">prev</button><p>It can be used to navigate too<br /></p></div>,
            },
            {
              title: 'Heights',
              content: <p>Stepper is set to 100% height so you can use a parent div to control its height and it will fill the space dynamically. This parent div is set to 450px height. This means the buttons stay fixed to the bottom in the same place always</p>,
            },
            {
              title: 'Hope you enjoy',
              content: <p>you can pass any content, we hope you like the stepper</p>,
            }
          ]}
        />
      </div> */}