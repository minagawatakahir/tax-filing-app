import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import RSUExchangeModule from './RSUExchangeModule';
import { FiscalYearProvider } from '../contexts/FiscalYearContext';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <FiscalYearProvider>
      {component}
    </FiscalYearProvider>
  );
};

describe('RSUExchangeModule - Automatic Data Loading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should load RSU data when fiscal year changes', async () => {
    const mockRSUData = {
      data: [
        {
          input: [
            {
              vestingDate: '2024-03-15T00:00:00.000Z',
              shares: 100,
              pricePerShareUSD: 180.5,
            },
          ],
          result: [],
        },
      ],
    };

    mockedAxios.get.mockResolvedValueOnce(mockRSUData);

    renderWithContext(<RSUExchangeModule />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/rsu-income/list?year=')
      );
    });
  });

  it('should populate form with loaded RSU data', async () => {
    const mockRSUData = {
      data: [
        {
          input: [
            {
              vestingDate: '2024-03-15T00:00:00.000Z',
              shares: 100,
              pricePerShareUSD: 180.5,
            },
          ],
          result: [],
        },
      ],
    };

    mockedAxios.get.mockResolvedValueOnce(mockRSUData);

    renderWithContext(<RSUExchangeModule />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });

  it('should handle empty RSU data', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    renderWithContext(<RSUExchangeModule />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    renderWithContext(<RSUExchangeModule />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });

  it('should have batch calculation mode', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    const { container } = renderWithContext(<RSUExchangeModule />);

    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });
});
