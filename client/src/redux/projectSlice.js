import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import workspaceService from '@/services/workspaceService';
import projectService from '@/services/projectService';

export const fetchWorkspaces = createAsyncThunk(
  'project/fetchWorkspaces',
  async (_, { rejectWithValue }) => {
    try {
      return await workspaceService.getAll();
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (workspaceId, { rejectWithValue }) => {
    try {
      return await projectService.getByWorkspace(workspaceId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  workspaces: [],
  projects: [],
  currentWorkspaceId: localStorage.getItem('currentWorkspaceId') || null,
  currentProjectId: localStorage.getItem('currentProjectId') || null,
  isLoading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    selectWorkspace: (state, action) => {
      state.currentWorkspaceId = action.payload;
      state.currentProjectId = null;
      state.projects = [];
      if (action.payload) {
        localStorage.setItem('currentWorkspaceId', action.payload);
      } else {
        localStorage.removeItem('currentWorkspaceId');
      }
      localStorage.removeItem('currentProjectId');
    },
    selectProject: (state, action) => {
      state.currentProjectId = action.payload;
      if (action.payload) {
        localStorage.setItem('currentProjectId', action.payload);
      } else {
        localStorage.removeItem('currentProjectId');
      }
    },
    clearProjectState: (state) => {
      state.workspaces = [];
      state.projects = [];
      state.currentWorkspaceId = null;
      state.currentProjectId = null;
      localStorage.removeItem('currentWorkspaceId');
      localStorage.removeItem('currentProjectId');
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Workspaces
      .addCase(fetchWorkspaces.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workspaces = action.payload;
        const currentWorkspaceExists = action.payload.some(
          (workspace) => workspace.id === state.currentWorkspaceId
        );
        if (state.currentWorkspaceId && !currentWorkspaceExists) {
          state.currentWorkspaceId = null;
          state.currentProjectId = null;
          state.projects = [];
          localStorage.removeItem('currentWorkspaceId');
          localStorage.removeItem('currentProjectId');
        }
        if (action.payload.length > 0 && !state.currentWorkspaceId) {
          state.currentWorkspaceId = action.payload[0].id;
          localStorage.setItem('currentWorkspaceId', action.payload[0].id);
        }
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
        const currentProjectExists = action.payload.some(
          (project) => project.id === state.currentProjectId
        );
        if (state.currentProjectId && !currentProjectExists) {
          state.currentProjectId = null;
          localStorage.removeItem('currentProjectId');
        }
        if (action.payload.length > 0 && !state.currentProjectId) {
          state.currentProjectId = action.payload[0].id;
          localStorage.setItem('currentProjectId', action.payload[0].id);
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { selectWorkspace, selectProject, clearProjectState } = projectSlice.actions;
export default projectSlice.reducer;
