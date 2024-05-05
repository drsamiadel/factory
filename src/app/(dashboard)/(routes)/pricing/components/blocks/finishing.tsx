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

const FinishingComponent = ({ finishing, input, handleChange, initialValues }: { finishing: any, input: any, handleChange: any, initialValues?: any }) => {
    const blockIndex = input.structure.additional.findIndex((block: any) => block.id === finishing.id);

    const currentPeice = finishing.peiceId;
    const currentPage = input.structure.additional.find((page: any) => page.peiceId === currentPeice && page.code === 1);
    const sheetsQuantity = currentPage ? currentPage.structure.sheetsQuantity : 0;

    React.useEffect(() => {
        function updatePlasticWindow() {
            const totalCost = (+finishing.structure.plasticWindow.quantity || 0) * (+finishing.structure.plasticWindow.cost || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.plasticWindow.totalCost`, value: totalCost } }, true);
        }

        updatePlasticWindow();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finishing.structure.plasticWindow.quantity, finishing.structure.plasticWindow.cost]);

    React.useEffect(() => {
        function updateGum() {
            const totalCost = (+finishing.structure.gum.quantity || 0) * (+finishing.structure.gum.cost || 0) + (+finishing.structure.gum.point || 0) * (+finishing.structure.gum.pointCost || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.gum.totalCost`, value: totalCost } }, true);
        }

        updateGum();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finishing.structure.gum.quantity, finishing.structure.gum.cost, finishing.structure.gum.point, finishing.structure.gum.pointCost]);

    React.useEffect(() => {
        function updatePasting() {
            const totalCost = (+finishing.structure.pasting.quantity || 0) * (+finishing.structure.pasting.cost || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.pasting.totalCost`, value: totalCost } }, true);
        }

        updatePasting();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finishing.structure.pasting.quantity, finishing.structure.pasting.cost]);

    React.useEffect(() => {
        function updateCut() {
            const totalCost = (+finishing.structure.cut.quantity || 0) * (+finishing.structure.cut.cost || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.cut.totalCost`, value: totalCost } }, true);
        }

        updateCut();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finishing.structure.cut.quantity, finishing.structure.cut.cost]);

    React.useEffect(() => {
        function updateBinding() {
            const totalCost = (+finishing.structure.binding.quantity || 0) * (+finishing.structure.binding.cost || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.binding.totalCost`, value: totalCost } }, true);
        }

        updateBinding();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finishing.structure.binding.quantity, finishing.structure.binding.cost]);

    React.useEffect(() => {
        function updatePacking() {
            const totalCost = (+finishing.structure.packing.quantity || 0) * (+finishing.structure.packing.cost || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.packing.totalCost`, value: totalCost } }, true);
        }

        updatePacking();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finishing.structure.packing.quantity, finishing.structure.packing.cost]);

    React.useEffect(() => {
        function updateDelivery() {
            const totalCost = (+finishing.structure.delivery.totalCost || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.delivery.totalCost`, value: totalCost } }, true);
        }

        updateDelivery();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finishing.structure.delivery.totalCost]);

    React.useEffect(() => {
        function updateTotalCost() {
            const totalCost = (+finishing.structure.plasticWindow.totalCost || 0) + (+finishing.structure.gum.totalCost || 0) + (+finishing.structure.pasting.totalCost || 0) + (+finishing.structure.cut.totalCost || 0) + (+finishing.structure.binding.totalCost || 0) + (+finishing.structure.packing.totalCost || 0) + (+finishing.structure.delivery.totalCost || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.totalCost`, value: totalCost } }, true);
        }

        updateTotalCost();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finishing.structure.plasticWindow.totalCost, finishing.structure.gum.totalCost, finishing.structure.pasting.totalCost, finishing.structure.cut.totalCost, finishing.structure.binding.totalCost, finishing.structure.packing.totalCost, finishing.structure.delivery.totalCost]);

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
                            value={finishing.peiceId ? finishing.peiceId : ""}
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
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                            <Checkbox checked={finishing.structure.plasticWindow.active} name={`structure.additional[${blockIndex}].structure.plasticWindow.active`} onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })} />
                            <Typography sx={{ marginTop: "7px"}}>Plastic Window</Typography>
                        </Grid>
                        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Quantity"
                                value={finishing.structure.plasticWindow.quantity || 0}
                                name={`structure.additional[${blockIndex}].structure.plasticWindow.quantity`}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!finishing.structure.plasticWindow.active}
                            />
                            <TextField
                                fullWidth
                                label="Size"
                                value={finishing.structure.plasticWindow.size || 0}
                                name={`structure.additional[${blockIndex}].structure.plasticWindow.size`}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!finishing.structure.plasticWindow.active}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Cost"
                                value={finishing.structure.plasticWindow.cost || 0}
                                name={`structure.additional[${blockIndex}].structure.plasticWindow.cost`}
                                onChange={handleChange}
                                disabled={!!!finishing.structure.plasticWindow.active}
                                size='small'
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Total"
                                value={finishing.structure.plasticWindow.totalCost || 0}
                                onChange={(e) => handleChange(e)}
                                disabled
                                size='small'
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                            <Checkbox checked={finishing.structure.gum.active} name={`structure.additional[${blockIndex}].structure.gum.active`} onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })} />
                            <Typography sx={{ marginTop: "7px" }}>Gum</Typography>
                        </Grid>
                        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Quantity"
                                value={finishing.structure.gum.quantity || 0}
                                name={`structure.additional[${blockIndex}].structure.gum.quantity`}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!finishing.structure.gum.active}
                            />
                            <TextField
                                fullWidth
                                label="Point"
                                value={finishing.structure.gum.point || 0}
                                name={`structure.additional[${blockIndex}].structure.gum.point`}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!finishing.structure.gum.active}
                            />
                        </Grid>
                        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Cost"
                                value={finishing.structure.gum.cost || 0}
                                name={`structure.additional[${blockIndex}].structure.gum.cost`}
                                onChange={handleChange}
                                disabled={!!!finishing.structure.gum.active}
                                size='small'
                            />
                            <TextField
                                fullWidth
                                label="Point Cost"
                                value={finishing.structure.gum.pointCost || 0}
                                name={`structure.additional[${blockIndex}].structure.gum.pointCost`}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!finishing.structure.gum.active}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Total"
                                value={finishing.structure.gum.totalCost || 0}
                                onChange={(e) => handleChange(e)}
                                disabled
                                size='small'
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                            <Checkbox checked={finishing.structure.pasting.active} name={`structure.additional[${blockIndex}].structure.pasting.active`} onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })} />
                            <Typography sx={{ marginTop: "7px" }}>Pasting</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Quantity"
                                value={finishing.structure.pasting.quantity || 0}
                                name={`structure.additional[${blockIndex}].structure.pasting.quantity`}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!finishing.structure.pasting.active}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Cost"
                                value={finishing.structure.pasting.cost || 0}
                                name={`structure.additional[${blockIndex}].structure.pasting.cost`}
                                onChange={handleChange}
                                disabled={!!!finishing.structure.pasting.active}
                                size='small'
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Total"
                                value={finishing.structure.pasting.totalCost || 0}
                                onChange={(e) => handleChange(e)}
                                disabled
                                size='small'
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                            <Checkbox checked={finishing.structure.cut.active} name={`structure.additional[${blockIndex}].structure.cut.active`} onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })} />
                            <Typography sx={{ marginTop: "7px" }}>Cut</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Quantity"
                                value={finishing.structure.cut.quantity || 0}
                                name={`structure.additional[${blockIndex}].structure.cut.quantity`}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!finishing.structure.cut.active}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Cost"
                                value={finishing.structure.cut.cost || 0}
                                name={`structure.additional[${blockIndex}].structure.cut.cost`}
                                onChange={handleChange}
                                disabled={!!!finishing.structure.cut.active}
                                size='small'
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Total"
                                value={finishing.structure.cut.totalCost || 0}
                                onChange={(e) => handleChange(e)}
                                disabled
                                size='small'
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                            <Checkbox checked={finishing.structure.binding.active} name={`structure.additional[${blockIndex}].structure.binding.active`} onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })} />
                            <Typography sx={{ marginTop: "7px" }}>Binding</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Quantity"
                                value={finishing.structure.binding.quantity || 0}
                                name={`structure.additional[${blockIndex}].structure.binding.quantity`}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!finishing.structure.binding.active}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Cost"
                                value={finishing.structure.binding.cost || 0}
                                name={`structure.additional[${blockIndex}].structure.binding.cost`}
                                onChange={handleChange}
                                disabled={!!!finishing.structure.binding.active}
                                size='small'
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Total"
                                value={finishing.structure.binding.totalCost || 0}
                                onChange={(e) => handleChange(e)}
                                disabled
                                size='small'
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                            <Checkbox checked={finishing.structure.packing.active} name={`structure.additional[${blockIndex}].structure.packing.active`} onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })} />
                            <Typography sx={{ marginTop: "7px" }}>Packing</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Quantity"
                                value={finishing.structure.packing.quantity || 0}
                                name={`structure.additional[${blockIndex}].structure.packing.quantity`}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!finishing.structure.packing.active}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Cost"
                                value={finishing.structure.packing.cost || 0}
                                name={`structure.additional[${blockIndex}].structure.packing.cost`}
                                onChange={handleChange}
                                disabled={!!!finishing.structure.packing.active}
                                size='small'
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Total"
                                value={finishing.structure.packing.totalCost || 0}
                                onChange={(e) => handleChange(e)}
                                disabled
                                size='small'
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                            <Checkbox checked={finishing.structure.delivery.active} name={`structure.additional[${blockIndex}].structure.delivery.active`} onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })} />
                            <Typography sx={{ marginTop: "7px" }}>Delivery</Typography>
                        </Grid>
                        <Grid item xs={6}>
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Total"
                                value={finishing.structure.delivery.totalCost || 0}
                                onChange={(e) => handleChange(e)}
                                size='small'
                                disabled={!!!finishing.structure.delivery.active}
                            />
                        </Grid>
                    </Grid>
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
                                value={finishing.structure.totalCost || 0}
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

export default FinishingComponent;