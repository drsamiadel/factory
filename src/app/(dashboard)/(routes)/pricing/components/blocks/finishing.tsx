import * as React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

const FinishingComponent = ({ finishing, input, handleChange, initialValues }: { finishing: any, input: any, handleChange: any, initialValues?: any }) => {
    const blockIndex = input.structure.additional.findIndex((block: any) => block.id === finishing.id);

    const currentPeice = finishing.peiceId;
    const currentPage = input.structure.additional.find((page: any) => page.peiceId === currentPeice && page.code === 1);
    const allPages = input.structure.additional.find((page: any) => page.peiceId === "all" && page.code === 1);
    const pageQuantity = currentPage ? currentPage.structure.sheetsQuantity : allPages ? allPages.structure.sheetsQuantity : 0;
    const allSheetsQuantity = input.structure.sheetsQuantity || 0;
    const sheetsQuantity = pageQuantity === 0 ? allSheetsQuantity : pageQuantity;

    React.useEffect(() => {
        function setAllQuantitiesAsSheetQuantity() {
            const blockCopy = { ...finishing };
            blockCopy.structure.plasticWindow.quantity = allSheetsQuantity;
            blockCopy.structure.gum.quantity = allSheetsQuantity;
            blockCopy.structure.pasting.quantity = allSheetsQuantity;
            blockCopy.structure.cut.quantity = allSheetsQuantity;
            blockCopy.structure.binding.quantity = allSheetsQuantity;
            blockCopy.structure.packing.quantity = allSheetsQuantity;
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.plasticWindow.quantity`, value: blockCopy.structure.plasticWindow.quantity } }, true);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.gum.quantity`, value: blockCopy.structure.gum.quantity } }, true);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.pasting.quantity`, value: blockCopy.structure.pasting.quantity } }, true);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.cut.quantity`, value: blockCopy.structure.cut.quantity } }, true);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.binding.quantity`, value: blockCopy.structure.binding.quantity } }, true);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.packing.quantity`, value: blockCopy.structure.packing.quantity } }, true);
        }

        setAllQuantitiesAsSheetQuantity();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetsQuantity]);

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
            const totalCost = (+finishing.structure.gum.quantity || 0) * (+finishing.structure.gum.point || 0) * (+finishing.structure.gum.pointCost || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.gum.totalCost`, value: totalCost } }, true);
        }

        updateGum();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finishing.structure.gum.quantity, finishing.structure.gum.cost, finishing.structure.gum.point, finishing.structure.gum.pointCost]);

    React.useEffect(() => {
        function updatePasting() {
            const totalCost = ((+finishing.structure.pasting.quantity || 0)) * (+finishing.structure.pasting.cost || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.pasting.totalCost`, value: totalCost } }, true);
        }

        updatePasting();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finishing.structure.pasting.quantity, finishing.structure.pasting.cost]);

    React.useEffect(() => {
        function updateCut() {
            const totalCost = ((+finishing.structure.cut.quantity || 0) / 1000) * (+finishing.structure.cut.cost || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.cut.totalCost`, value: totalCost } }, true);
        }

        updateCut();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finishing.structure.cut.quantity, finishing.structure.cut.cost]);

    React.useEffect(() => {
        function updateBinding() {
            const totalCost = ((+finishing.structure.binding.quantity || 0) / 1000) * (+finishing.structure.binding.cost || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.binding.totalCost`, value: totalCost } }, true);
        }

        updateBinding();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finishing.structure.binding.quantity, finishing.structure.binding.cost]);

    React.useEffect(() => {
        function updatePacking() {
            const totalCost = ((+finishing.structure.packing.quantity || 0)) * (+finishing.structure.packing.cost || 0);
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
            const totalCost = (
                finishing.structure.plasticWindow.active ? (+finishing.structure.plasticWindow.totalCost || 0) : 0
            ) + (
                    finishing.structure.gum.active ? (+finishing.structure.gum.totalCost || 0) : 0
                ) + (
                    finishing.structure.pasting.active ? (+finishing.structure.pasting.totalCost || 0) : 0
                ) + (
                    finishing.structure.cut.active ? (+finishing.structure.cut.totalCost || 0) : 0
                ) + (
                    finishing.structure.binding.active ? (+finishing.structure.binding.totalCost || 0) : 0
                ) + (
                    finishing.structure.packing.active ? (+finishing.structure.packing.totalCost || 0) : 0
                ) + (
                    finishing.structure.delivery.active ? (+finishing.structure.delivery.totalCost || 0) : 0
                );

            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.totalCost`, value: totalCost } }, true);
        }

        updateTotalCost();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finishing.structure.plasticWindow.totalCost, finishing.structure.gum.totalCost, finishing.structure.pasting.totalCost, finishing.structure.cut.totalCost, finishing.structure.binding.totalCost, finishing.structure.packing.totalCost, finishing.structure.delivery.totalCost, finishing.structure.plasticWindow.active, finishing.structure.gum.active, finishing.structure.pasting.active, finishing.structure.cut.active, finishing.structure.binding.active, finishing.structure.packing.active, finishing.structure.delivery.active]);

    return (
        <Grid item xs={12}>
            <Grid container spacing={2}>
                <Grid item xs={!!finishing.structure.plasticWindow.active ? 12 : 2}>
                    <Grid container spacing={2}>
                        <Grid item sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }} xs>
                            <Checkbox checked={finishing.structure.plasticWindow.active} name={`structure.additional[${blockIndex}].structure.plasticWindow.active`} onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })} />
                            <Typography sx={{ marginTop: "7px" }}>Plastic Window</Typography>
                        </Grid>
                        {!!finishing.structure.plasticWindow.active && (
                            <>
                                <Grid item xs={2}>
                                    <TextField
                                        fullWidth
                                        label="Quantity"
                                        value={finishing.structure.plasticWindow.quantity || 0}
                                        name={`structure.additional[${blockIndex}].structure.plasticWindow.quantity`}
                                        onChange={handleChange}
                                        size='small'
                                        disabled={!!!finishing.structure.plasticWindow.active}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <TextField
                                        fullWidth
                                        label="Size"
                                        value={finishing.structure.plasticWindow.size || ""}
                                        name={`structure.additional[${blockIndex}].structure.plasticWindow.size`}
                                        onChange={handleChange}
                                        size='small'
                                        disabled={!!!finishing.structure.plasticWindow.active}
                                    />
                                </Grid>
                                <Grid item xs={2}>
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
                                <Grid item xs={2}>
                                    <TextField
                                        fullWidth
                                        label="Total"
                                        value={finishing.structure.plasticWindow.totalCost || 0}
                                        name={`structure.additional[${blockIndex}].structure.plasticWindow.totalCost`}
                                        onChange={(e) => handleChange(e)}
                                        disabled={!!!finishing.structure.plasticWindow.active}
                                        size='small'
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Grid>
                <Grid item xs={!!finishing.structure.gum.active ? 12 : 2}>
                    <Grid container spacing={2}>
                        <Grid item xs sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                            <Checkbox checked={finishing.structure.gum.active} name={`structure.additional[${blockIndex}].structure.gum.active`} onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })} />
                            <Typography sx={{ marginTop: "7px" }}>Gum</Typography>
                        </Grid>
                        {!!finishing.structure.gum.active && (
                            <>
                                <Grid item xs={2}>
                                    <TextField
                                        fullWidth
                                        label="Quantity"
                                        value={finishing.structure.gum.quantity || 0}
                                        name={`structure.additional[${blockIndex}].structure.gum.quantity`}
                                        onChange={handleChange}
                                        size='small'
                                        disabled={!!!finishing.structure.gum.active}
                                    />
                                </Grid>
                                <Grid item xs={2}>
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
                                <Grid item xs={2}>
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
                                <Grid item xs={2}>
                                    <TextField
                                        fullWidth
                                        label="Total"
                                        value={finishing.structure.gum.totalCost || 0}
                                        name={`structure.additional[${blockIndex}].structure.gum.totalCost`}
                                        onChange={(e) => handleChange(e)}
                                        disabled={!!!finishing.structure.gum.active}
                                        size='small'
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Grid>
                <Grid item xs={!!finishing.structure.pasting.active ? 12 : 2}>
                    <Grid container spacing={2}>
                        <Grid item xs sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                            <Checkbox checked={finishing.structure.pasting.active} name={`structure.additional[${blockIndex}].structure.pasting.active`} onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })} />
                            <Typography sx={{ marginTop: "7px" }}>Pasting</Typography>
                        </Grid>
                        {!!finishing.structure.pasting.active && (
                            <>
                                <Grid item xs={2}>
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
                                <Grid item xs={2}>
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
                                <Grid item xs={2}>
                                    <TextField
                                        fullWidth
                                        label="Total"
                                        value={finishing.structure.pasting.totalCost || 0}
                                        onChange={(e) => handleChange(e)}
                                        name={`structure.additional[${blockIndex}].structure.pasting.totalCost`}
                                        disabled={!!!finishing.structure.pasting.active}
                                        size='small'
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Grid>
                <Grid item xs={!!finishing.structure.cut.active ? 12 : 2}>
                    <Grid container spacing={2}>
                        <Grid item xs sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                            <Checkbox checked={finishing.structure.cut.active} name={`structure.additional[${blockIndex}].structure.cut.active`} onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })} />
                            <Typography sx={{ marginTop: "7px" }}>Cut</Typography>
                        </Grid>
                        {!!finishing.structure.cut.active && (
                            <>
                                <Grid item xs={2}>
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
                                <Grid item xs={2}>
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
                                <Grid item xs={2}>
                                    <TextField
                                        fullWidth
                                        label="Total"
                                        value={finishing.structure.cut.totalCost || 0}
                                        name={`structure.additional[${blockIndex}].structure.cut.totalCost`}
                                        onChange={(e) => handleChange(e)}
                                        disabled={!!!finishing.structure.cut.active}
                                        size='small'
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Grid>
                <Grid item xs={!!finishing.structure.binding.active ? 12 : 2}>
                    <Grid container spacing={2}>
                        <Grid item xs sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                            <Checkbox checked={finishing.structure.binding.active} name={`structure.additional[${blockIndex}].structure.binding.active`} onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })} />
                            <Typography sx={{ marginTop: "7px" }}>Binding</Typography>
                        </Grid>
                        {!!finishing.structure.binding.active && (
                            <>
                                <Grid item xs={2}>
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
                                <Grid item xs={2}>
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
                                <Grid item xs={2}>
                                    <TextField
                                        fullWidth
                                        label="Total"
                                        value={finishing.structure.binding.totalCost || 0}
                                        onChange={(e) => handleChange(e)}
                                        name={`structure.additional[${blockIndex}].structure.binding.totalCost`}
                                        disabled={!!!finishing.structure.binding.active}
                                        size='small'
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Grid>
                <Grid item xs={!!finishing.structure.packing.active ? 12 : 2}>
                    <Grid container spacing={2}>
                        <Grid item xs sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                            <Checkbox checked={finishing.structure.packing.active} name={`structure.additional[${blockIndex}].structure.packing.active`} onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })} />
                            <Typography sx={{ marginTop: "7px" }}>Packing</Typography>
                        </Grid>
                        {!!finishing.structure.packing.active && (
                            <>
                                <Grid item xs={2}>
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
                                <Grid item xs={2}>
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
                                <Grid item xs={2}>
                                    <TextField
                                        fullWidth
                                        label="Total"
                                        value={finishing.structure.packing.totalCost || 0}
                                        name={`structure.additional[${blockIndex}].structure.packing.totalCost`}
                                        onChange={(e) => handleChange(e)}
                                        disabled={!!!finishing.structure.packing.active}
                                        size='small'
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Grid>
                <Grid item xs={!!finishing.structure.delivery.active ? 12 : 2}>
                    <Grid container spacing={2}>
                        <Grid item xs sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                            <Checkbox checked={finishing.structure.delivery.active} name={`structure.additional[${blockIndex}].structure.delivery.active`} onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })} />
                            <Typography sx={{ marginTop: "7px" }}>Delivery</Typography>
                        </Grid>
                        {!!finishing.structure.delivery.active && (
                            <>
                                <Grid item xs={6}>
                                </Grid>
                                <Grid item xs={2}>
                                    <TextField
                                        fullWidth
                                        label="Total"
                                        value={finishing.structure.delivery.totalCost || 0}
                                        name={`structure.additional[${blockIndex}].structure.delivery.totalCost`}
                                        onChange={(e) => handleChange(e)}
                                        size='small'
                                        disabled={!!!finishing.structure.delivery.active}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2} sx={{ justifyContent: "end", alignItems: "end" }} direction="column">
                        <Grid item xs={2}>
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