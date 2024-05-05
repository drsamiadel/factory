import * as React from 'react';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import { v4 as uuidv4 } from 'uuid';
import { Material } from '@prisma/client';
import { useDebounce } from '../../../../../../lib/use-debounce';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

const VarnishComponent = ({ varnish, input, handleChange, initialValues }: { varnish: any, input: any, handleChange: any, initialValues?: any }) => {
    const blockIndex = input.structure.additional.findIndex((block: any) => block.id === varnish.id);

    const currentPeice = varnish.peiceId;
    const currentPage = input.structure.additional.find((page: any) => page.peiceId === currentPeice && page.code === 1);
    const sheetsQuantity = currentPage ? currentPage.structure.sheetsQuantity : 0;
    const currentOffset = input.structure.additional.find((page: any) => page.peiceId === currentPeice && page.code === 2);
    const offsetQuantity = currentOffset ? currentOffset.structure.quantity : 0;

    React.useEffect(() => {
        function calculateCostFront() {
            const varnishCost = varnish.structure.faces[0].varnishCost || 0;
            const quantity = offsetQuantity;
            const thousand = +(quantity / 1000).toFixed(2);
            const totalCost = +varnishCost * +thousand;
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[0].totalCost`, value: totalCost } }, true);
        }

        function calculateCostBack() {
            const varnishCost = varnish.structure.faces[1].varnishCost || 0;
            const quantity = offsetQuantity;
            const thousand = +(quantity / 1000).toFixed(2);
            const totalCost = +varnishCost * +thousand;
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[1].totalCost`, value: totalCost } }, true);
        }

        function calculateTotalCost() {
            const totalCost = (
                varnish.structure.faces[0].active ? varnish.structure.faces[0].totalCost : 0
            ) + (
                    varnish.structure.faces[1].active ? varnish.structure.faces[1].totalCost : 0
                );
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.totalCost`, value: totalCost } }, true);
        }

        calculateCostFront();
        calculateCostBack();
        calculateTotalCost();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offsetQuantity, varnish.structure.faces[0].varnishCost, varnish.structure.faces[1].varnishCost, varnish.structure.faces[0].active, varnish.structure.faces[1].active]);

    return (
        <Grid item xs={12}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="selectPart">select a part</InputLabel>
                        <Select
                            size='small'
                            labelId="selectPart"
                            id="selectPart"
                            value={varnish.peiceId ? varnish.peiceId : ""}
                            label="select a part"
                            name={`structure.additional[${blockIndex}].peiceId`}
                            onChange={(e: SelectChangeEvent) => handleChange(e)}
                        >
                            {input.structure.input.structure.peices.map((peice: any) => (
                                <MenuItem value={peice.id} key={peice.id}>{peice.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={3}>
                    <Checkbox checked={varnish.structure.faces[0].active} onChange={(e) => handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[0].active`, value: e.target.checked } })} />
                    {varnish.structure.faces[0].name}
                </Grid>
                <Grid item xs={3}>
                    <Autocomplete
                        id="combo-for-varnishType"
                        options={["MATT", "GLOSSY", "UV", "UV Spot"]}
                        getOptionLabel={(option) => option.toString()}
                        renderOption={(props, option) => (
                            <ListItem {...props} key={option}> <ListItemText primary={option} /> </ListItem>
                        )}
                        renderInput={(params) => <TextField {...params} label="Varnish Type" />}
                        onChange={(event, value) => {
                            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[0].varnishType`, value: value ? value : null } });
                        }}
                        size='small'
                        value={varnish.structure.faces[0].varnishType || ""}
                        disabled={!!!varnish.structure.faces[0].active}
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="Varnish Quantity"
                        name={`structure.additional[${blockIndex}].structure.quantity`}
                        value={offsetQuantity || 0}
                        onChange={handleChange}
                        size='small'
                        disabled
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="Varnish Cost"
                        name={`structure.additional[${blockIndex}].structure.faces[0].varnishCost`}
                        value={+varnish.structure.faces[0].varnishCost || 0}
                        onChange={handleChange}
                        size='small'
                        disabled={!!!varnish.structure.faces[0].active}
                    />
                </Grid>
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "end" }}>
                    <TextField
                        sx={{ width: "250px" }}
                        label="Cost"
                        value={varnish.structure.faces[0].totalCost || 0}
                        onChange={(e) => handleChange(e)}
                        disabled
                        size='small'
                    />
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={3}>
                    <Checkbox checked={varnish.structure.faces[1].active} onChange={(e) => handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[1].active`, value: e.target.checked } })} />
                    {varnish.structure.faces[1].name}
                </Grid>
                <Grid item xs={3}>
                    <Autocomplete
                        id="combo-for-varnishType"
                        options={["MATT", "GLOSSY", "UV", "UV Spot"]}
                        getOptionLabel={(option) => option.toString()}
                        renderOption={(props, option) => (
                            <ListItem {...props} key={option}> <ListItemText primary={option} /> </ListItem>
                        )}
                        renderInput={(params) => <TextField {...params} label="Varnish Type" />}
                        onChange={(event, value) => {
                            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[1].varnishType`, value: value ? value : null } });
                        }}
                        size='small'
                        value={varnish.structure.faces[1].varnishType || ""}
                        disabled={!!!varnish.structure.faces[1].active}
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="Varnish Quantity"
                        name={`structure.additional[${blockIndex}].structure.quantity`}
                        value={offsetQuantity || 0}
                        onChange={handleChange}
                        size='small'
                        disabled
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="Varnish Cost"
                        name={`structure.additional[${blockIndex}].structure.faces[1].varnishCost`}
                        value={+varnish.structure.faces[1].varnishCost || 0}
                        onChange={handleChange}
                        size='small'
                        disabled={!!!varnish.structure.faces[1].active}
                    />
                </Grid>
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "end" }}>
                    <TextField
                        sx={{ width: "250px" }}
                        label="Cost"
                        value={varnish.structure.faces[1].totalCost || 0}
                        onChange={(e) => handleChange(e)}
                        disabled
                        size='small'
                    />
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2} sx={{ justifyContent: "end", alignItems: "end" }} direction="column">
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Total Cost"
                                value={varnish.structure.totalCost || 0}
                                onChange={(e) => handleChange(e)}
                                disabled
                                size='small'
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
};

export default VarnishComponent;