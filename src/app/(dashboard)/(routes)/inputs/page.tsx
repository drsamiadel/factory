"use client"

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Form from './components/form';

import Button from '@mui/material/Button';
import Image from 'next/image';
import { CREATE, DELETE, UPDATE } from '@/actions/input';
import { Image as ImageType, Input, User } from '@prisma/client';
import Skeleton from '@mui/material/Skeleton';

import { useDebounce } from "@/lib/use-debounce";
import DeleteBTN from './components/delete';
import { Visibility, VisibilityOffRounded } from '@mui/icons-material';


interface InputWithUserAndImages extends Partial<Input> {
    structure: {
        peices: {
            id: string;
            name: string;
            fields: {
                id: string;
                name: string;
                key: string;
                value: number;
            }[];
            equation: {
                width: string;
                height: string;
            };
        }[];
    };
    images: string[];
    user: Partial<User>;
}

interface HeadCell {
    id: string;
    label: string;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string },
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
    height: 40,
}));

const headCells: readonly HeadCell[] = [
    { id: 'name', label: 'Name' },
    { id: 'category', label: 'Category' },
    { id: 'code', label: 'Code' },
    { id: 'peices', label: 'Peices' },
    { id: 'createdAt', label: 'Date' },
    { id: 'actions', label: '' },
];

const StyledTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
    '&.MuiTableSortLabel-root': {
        color: 'white',
    },
    '&.MuiTableSortLabel-active': {
        color: 'white',
    },
    '&.MuiTableSortLabel-icon': {
        color: 'white',
    },
}));

export default function CustomizedTables() {
    const [page, setPage] = React.useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
    const [search, setSearch] = React.useState<string>("");
    const [rows, setRows] = React.useState<InputWithUserAndImages[] | []>([]);
    const [count, setCount] = React.useState<number>(0);
    const [open, setOpen] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(true);
    const [order, setOrder] = React.useState<Order>('desc');
    const [orderBy, setOrderBy] = React.useState<keyof InputWithUserAndImages>('createdAt');
    const [step, setStep] = React.useState<number>(0);

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof InputWithUserAndImages,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedId("");
        setStep(0);
    };

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'n') {
                handleClickOpen();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const debouncedSearch = useDebounce(search, 500);

    React.useEffect(() => {
        const fetchInputs = async () => {
            setLoading(true);

            const response = await fetch(`/api/data/input?filterByName=${debouncedSearch}&page=${page + 1}&limit=${rowsPerPage}&sorting=${orderBy}&order=${order}`);

            if (response.ok) {
                const data = await response.json();
                console.log(data)
                setRows(data.inputs);
                setCount(data.count);
            }

            setLoading(false);
        }

        fetchInputs();
    }, [debouncedSearch, page, rowsPerPage, orderBy, order]);


    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (searchedVal: string) => {
        setSearch(searchedVal);
    };

    const handleDelete = async (id: string) => {
        await DELETE(id).then((res) => {
            const updatedRows = rows.filter((row) => row.id !== res);
            setRows(updatedRows as InputWithUserAndImages[]);
        }).catch((err) => {
            console.log(err);
        });
    };

    const handleCreate = async (data: any) => {
        const images = data.images;
        const files = images.map((image: any, i: number) => dataURLtoFile(image, `${data.name + i}.png`));
        const formData = new FormData();
        files.forEach((file: any) => {
            formData.append('files', file);
        });

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload images');
        }

        const uploadedImages = await response.json();

        const updatedImages = images.map((image: any, i: number) => {
            return uploadedImages[i].data.url
        }) as String[];

        data.images = updatedImages;

        const result = await CREATE(data);
        if ('error' in result) {
            throw new Error(result.error.message);
        } else {
            setRows((prev) => [...prev, result as InputWithUserAndImages]);
        }
    };

    const handleUpdate = async (data: any) => {
        const images = data.images as String[];

        const newImages = images.filter((image: any) => image.startsWith('data:image'));

        if (newImages.length > 0) {

            const files = newImages.map((image: any, i: number) => dataURLtoFile(image, `${data.name + i}.png`));

            const formData = new FormData();
            files.forEach((file: any) => {
                formData.append('files', file);
            });

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload images');
            }

            const uploadedImages = await response.json();

            const updatedImages = newImages.map((image: any, i: number) => {
                return uploadedImages[i].data.url
            }) as String[];

            if (updatedImages.length > 0) {
                data.images = updatedImages;
            }

        }

        const result = await UPDATE(data);
        if ('error' in result) {
            throw new Error(result.error.message);
        } else {
            setRows((prev: InputWithUserAndImages[]) => {
                const updatedRows = prev.map((row) => {
                    if (row.id === result.id) {
                        return result;
                    }
                    return row;
                });
                return updatedRows as InputWithUserAndImages[];
            });
        }
    };

    const handleEdit = (id: string) => {
        setSelectedId(id);
        handleClickOpen();
    };

    const dataURLtoFile = (dataurl: string, filename: string) => {
        var arr = dataurl.split(','),
            mime = 'image/png',
            bstr = atob(arr[arr.length - 1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    return (
        <Box
            component="div"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'end',
                width: '100%',
                gap: 3,
            }}
        >
            <Form onClose={handleClose} open={open} onSubmit={selectedId ? handleUpdate : handleCreate} initialValues={selectedId ? rows.find((row) => row.id === selectedId) : null} step={step} />
            <Box
                component="div"
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'end',
                    alignItems: 'center',
                    width: '100%',
                    gap: 1,
                }}
            >
                <TextField placeholder="Search" variant="outlined" value={search} onChange={(e) => { handleSearch(e.target.value) }} sx={{
                    [`& input`]: {
                        height: "37px",
                        padding: "0 14px",
                    },
                }}
                />
                <Button variant="contained" sx={{ textWrap: "nowrap" }} onClick={handleClickOpen}>
                    Add Input [N]
                </Button>
            </Box>
            <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table" size={'small'}>
                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <StyledTableCell
                                    key={headCell.id}
                                    align={headCell.id === 'peices' || headCell.id === 'createdAt' ? 'right' : 'left'}
                                    sortDirection={orderBy === headCell.id ? order : false}
                                >
                                    {headCell.id === 'name' || headCell.id === 'code' || headCell.id === "category" || headCell.id === 'createdAt' ? (
                                        <StyledTableSortLabel
                                            sx={{ "&.MuiTableSortLabel-root": { color: "white" }, "&.MuiTableSortLabel-active": { color: "white" }, "&.MuiTableSortLabel-icon": { color: "white" } }}
                                            active={orderBy === headCell.id}
                                            direction={orderBy === headCell.id ? order : 'asc'}
                                            onClick={(event) => handleRequestSort(event, headCell.id as keyof InputWithUserAndImages)}
                                            disabled={loading}
                                        >
                                            {headCell.label}
                                        </StyledTableSortLabel>
                                    ) : (
                                        headCell.label
                                    )}
                                </StyledTableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <StyledTableRow>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell sx={{ display: 'flex', gap: 2, flexDirection: "row", justifyContent: "end", alignItems: "center" }}>
                                    <Skeleton variant="circular" width={35} height={35} />
                                    <Skeleton variant="circular" width={35} height={35} />
                                </StyledTableCell>
                            </StyledTableRow>
                        ) : rows.length === 0 ?
                            <StyledTableRow>
                                <StyledTableCell colSpan={6} align="center">No data found</StyledTableCell>
                            </StyledTableRow>
                            :
                            rows.map((row) => (
                                <StyledTableRow key={row.id}>
                                    <StyledTableCell component="th" scope="row">
                                        <Box sx={{ display: 'flex', gap: 2, flexDirection: "row", justifyContent: "start", alignItems: "center" }}>
                                            {row.images.length !== 0 && <Image src={row.images[0]!} alt={row.name as string} width={50} height={50} priority style={{ borderRadius: 6, height: "1.75rem", width: "1.75rem", overflow: "hidden" }} />}
                                            {row.name}
                                            <IconButton onClick={() => {
                                                setSelectedId(row.id!);
                                                setStep(2);
                                                handleClickOpen();
                                            }}>
                                                <Visibility />
                                            </IconButton>
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell>{row?.category || ""}</StyledTableCell>
                                    <StyledTableCell>{row.code}</StyledTableCell>
                                    <StyledTableCell align="right">{row?.structure?.peices.length}</StyledTableCell>
                                    <StyledTableCell align="right">
                                        {new Date(row.createdAt as Date).toLocaleString()}
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 1, flexDirection: "row", justifyContent: "end", alignItems: "center" }}>
                                            <IconButton aria-label="edit" sx={{ color: "success.main", p: 0 }} onClick={() => handleEdit(row.id!)}>
                                                <EditRoundedIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                            <DeleteBTN onAgree={() => handleDelete(row.id!)} />
                                        </Box>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
}
