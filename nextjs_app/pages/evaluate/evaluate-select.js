import React from 'react';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { Layers, Psychology } from '@mui/icons-material';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/router';
import axios from 'axios';

import {CustomTooltip} from '/components/CustomToolTip.js';

const EvaluateSelect = () => {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get("/api/user",).then((res) => {
      setUser(res.data);
      setLoading(false);
    }).catch((error) => console.log(error));
  }, []);


  const EvaluationBox = ({ href, title, description, disabled }) => {
    let mainColor;
    if (disabled) {
      mainColor = "grey";
    } else {
      mainColor = "#9C2315";
    }

    const LinkBox = () => (
      <Link href={disabled ? '#' : href} passHref >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: 250,
            backgroundColor: '#f9f9f9',
            borderRadius: 4,
            border: '1px solid #ccc',
            maxWidth: 300, // Adjust the maxWidth to make the rectangles narrower
            cursor: 'pointer',
            p: 2, // Add padding to the boxes
          }}
        >
          {title === "Evaluate base model" ?
            <Layers fontSize="inherit" sx={{ color: [mainColor], fontSize: '50px' }} />
            :
            <Psychology fontSize="inherit" sx={{ color: [mainColor], fontSize: '50px' }} />
          }
          <Typography variant="h6" color={mainColor} align="center" sx={{ mt: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2" align="center" sx={{ mt: 1 }} color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Link>
    );

    return(
      <>
        {disabled ?
          <CustomTooltip title="💡 Add your OpenAI or Cohere API key to evaluate a base model." className='tooltip'>
            <span><LinkBox /></span>
          </CustomTooltip>
          :
          <LinkBox />
        }
      </>
    );
  }

  if (loading) {
    return <div className='main vertical-box'><CircularProgress /></div>
  }

  return (
    <div className="main">
      <div className='horizontal-box full-width'>
        <div className='horizontal-box'>
          <FaArrowLeft size='30' onClick={() => router.back()} className='back-icon cursor-pointer'/>
          <Typography variant='h4' className='page-main-header'>
            Evaluate
          </Typography>
        </div>
      </div>
      <div className='small-space' />
      <Grid container spacing={2} justifyContent='center'>
        <Grid item>
          <EvaluationBox
            href="/evaluate/evaluate-base"
            title="Evaluate base model"
            description="Click here to evaluate the performance of a base model with a custom prompt."
            disabled={!user.openAiKey && !user.cohereKey}
          />
        </Grid>
        <Grid item>
          <EvaluationBox
            href="/evaluate/evaluate-finetuned"
            title="Evaluate finetuned model"
            description="Click here to evaluate the performance of your finetuned model."
            disabled={false}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default EvaluateSelect;

