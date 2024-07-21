import {
  Typography,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { ORDER_TYPE, CATEGORY } from '@constants/index';
import { SettingsState } from '@states/index';
import { inputLeft, inputRight, inputBase } from '@utils/index';
import { useEffect } from 'react';

export const SettingsForm = () => {
  const {
    risk,
    setRisk,
    orderbook,
    setOrderbook,
    orderTypeStoploss,
    setOrderTypeStoploss,
    orderTypeTakeProfit,
    setOrderTypeTakeProfit,
    autoFill,
    toggleAutoFill,
    category,
    autoRemoveDrawings,
    toggleAutoRemoveDrawings,
  } = SettingsState();

  return (
    <>
      <div>
        <Typography variant="h6" sx={{ mb: 2 }} className="block">
          ⚙️ Settings
        </Typography>

        <TextField
          {...inputLeft}
          value={risk}
          disabled={!autoFill}
          onChange={(e) => setRisk(e.target.value)}
          onClick={(e) => e.target?.select()}
          label="Max risk"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          InputProps={{ endAdornment: '%' }}
        />

        <TextField
          {...inputBase}
          value={orderbook}
          onChange={(e) => setOrderbook(e.target.value)}
          onBlur={(e) => {
            enqueueSnackbar(`Saved in your local storage`, {
              variant: 'info',
              autoHideDuration: 2000,
            });
          }}
          label="Link to your orderbook"
          InputProps={{ startAdornment: 'https://' }}
        />
        <FormControl {...inputLeft} size="small" focused>
          <InputLabel color="error" id="demo-select-small-label">
            Stoploss order
          </InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            value={orderTypeStoploss}
            label="Stoploss order"
            onChange={(e) => setOrderTypeStoploss(e.target.value)}
            color="error"
            sx={{ textTransform: 'capitalize' }}
          >
            <MenuItem sx={{ textTransform: 'capitalize' }} value={ORDER_TYPE.LIMIT}>
              {ORDER_TYPE.LIMIT}
            </MenuItem>
            <MenuItem sx={{ textTransform: 'capitalize' }} value={ORDER_TYPE.MARKET}>
              {ORDER_TYPE.MARKET}
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl {...inputLeft} size="small" focused>
          <InputLabel color="success" id="demo-select-small-label">
            Take profit order
          </InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            value={orderTypeTakeProfit}
            sx={{ textTransform: 'capitalize' }}
            onChange={(e: any) => setOrderTypeTakeProfit(e.target.value)}
            label="Take profit order"
            color="success"
          >
            <MenuItem sx={{ textTransform: 'capitalize' }} value={ORDER_TYPE.LIMIT}>
              {ORDER_TYPE.LIMIT}
            </MenuItem>
            <MenuItem sx={{ textTransform: 'capitalize' }} value={ORDER_TYPE.MARKET}>
              {ORDER_TYPE.MARKET}
            </MenuItem>
          </Select>
        </FormControl>

        <ToggleButtonGroup fullWidth color="primary" value={category} size="small" exclusive onChange={() => {}}>
          <ToggleButton disabled value="spot">
            spot
          </ToggleButton>
          <ToggleButton disabled value={CATEGORY.LINEAR}>
            Derivates
          </ToggleButton>
          <ToggleButton disabled value={CATEGORY.INVERSE}>
            Inverse
          </ToggleButton>
        </ToggleButtonGroup>

        <FormControlLabel
          // {...inputLeft}
          sx={{ ml: 'auto', mt: 2 }}
          control={<Switch checked={autoRemoveDrawings} onChange={toggleAutoRemoveDrawings} />}
          label="Auto remove drawings"
          // labelPlacement="start"
        />
        <FormControlLabel
          // {...inputLeft}
          sx={{ ml: 'auto', mt: 2 }}
          control={<Switch checked={autoFill} onChange={toggleAutoFill} />}
          label="Form autofill"
        />
      </div>
    </>
  );
};
