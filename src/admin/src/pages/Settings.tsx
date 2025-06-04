import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSetting } from '../services/api';

interface Language {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
  translations: Record<string, string>;
}

interface LanguageDialogData {
  type: 'add' | 'edit';
  language?: Language;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState(0);
  const [languageDialog, setLanguageDialog] = useState<LanguageDialogData | null>(null);
  const [editedLanguage, setEditedLanguage] = useState<Language | null>(null);
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) => updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setLanguageDialog(null);
      setEditedLanguage(null);
    }
  });

  const handleSaveLanguage = () => {
    if (!editedLanguage) return;

    const languages = settings?.data.find((s) => s.key === 'languages')?.value || [];
    const updatedLanguages = languageDialog?.type === 'add'
      ? [...languages, editedLanguage]
      : languages.map((lang: Language) =>
          lang.code === editedLanguage.code ? editedLanguage : lang
        );

    updateMutation.mutate({
      key: 'languages',
      value: updatedLanguages,
    });
  };

  const handleDeleteLanguage = (code: string) => {
    const languages = settings?.data.find((s) => s.key === 'languages')?.value || [];
    const updatedLanguages = languages.filter((lang: Language) => lang.code !== code);

    updateMutation.mutate({
      key: 'languages',
      value: updatedLanguages,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const languages = settings?.data.find((s) => s.key === 'languages')?.value || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Settings</Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Languages" />
          <Tab label="General" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => {
                setLanguageDialog({ type: 'add' });
                setEditedLanguage({ code: '', name: '', direction: 'ltr', translations: {} });
              }}
            >
              Add Language
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Direction</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {languages.map((language: Language) => (
                  <TableRow key={language.code}>
                    <TableCell>{language.code}</TableCell>
                    <TableCell>{language.name}</TableCell>
                    <TableCell>{language.direction}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setLanguageDialog({ type: 'edit', language });
                          setEditedLanguage(language);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteLanguage(language.code)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {activeTab === 1 && (
        <Typography>General settings coming soon...</Typography>
      )}

      <Dialog
        open={!!languageDialog}
        onClose={() => {
          setLanguageDialog(null);
          setEditedLanguage(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {languageDialog?.type === 'add' ? 'Add Language' : 'Edit Language'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Language Code"
              value={editedLanguage?.code || ''}
              onChange={(e) =>
                setEditedLanguage((prev) =>
                  prev ? { ...prev, code: e.target.value } : null
                )
              }
              disabled={languageDialog?.type === 'edit'}
              required
            />
            <TextField
              label="Language Name"
              value={editedLanguage?.name || ''}
              onChange={(e) =>
                setEditedLanguage((prev) =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
              required
            />
            <TextField
              select
              label="Text Direction"
              value={editedLanguage?.direction || 'ltr'}
              onChange={(e) =>
                setEditedLanguage((prev) =>
                  prev ? { ...prev, direction: e.target.value as 'ltr' | 'rtl' } : null
                )
              }
              SelectProps={{
                native: true,
              }}
            >
              <option value="ltr">Left to Right (LTR)</option>
              <option value="rtl">Right to Left (RTL)</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setLanguageDialog(null);
              setEditedLanguage(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveLanguage}
            color="primary"
            disabled={!editedLanguage?.code || !editedLanguage?.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 