import type { Meta, StoryObj } from '@storybook/react'; // eslint-disable-line @typescript-eslint/no-unused-vars
import React, { useState } from 'react';
import { Autocomplete, AutocompleteOption, SearchAutocompleteItem } from '../index';

const options1000 = Array.from({ length: 1000 }).map((_, index) => 'Item#' + (index + 1));

// ---------------------------------------------------------------------------
// NgModel-style wrapper story
// ---------------------------------------------------------------------------

interface NgModelWrapperProps {
  options: string[];
  minimumSearchTextLength?: number;
  placeholder?: string;
  onSelection?: (event: any) => void;
  onClearedSearchText?: () => void;
}

const NgModelWrapper: React.FC<NgModelWrapperProps> = ({
  options = [],
  minimumSearchTextLength = 3,
  placeholder = '',
  onSelection,
  onClearedSearchText,
}) => {
  const [searchedText, setSearchedText] = useState('');
  const [selectedValue, setSelectedValue] = useState<any>(null);

  const filteredOptions =
    searchedText.length > 2
      ? options.filter(o => o.toLowerCase().includes(searchedText.toLowerCase()))
      : [];

  return (
    <div style={{ width: '300px' }}>
      <Autocomplete
        value={searchedText}
        onChange={setSearchedText}
        onOptionSelected={event => {
          setSelectedValue(event);
          onSelection?.(event);
        }}
        onClearedSearchText={() => {
          setSearchedText('');
          onClearedSearchText?.();
        }}
        minimumSearchTextLength={minimumSearchTextLength}
        placeholder={placeholder}
        ariaLabel="Search for items"
      >
        {filteredOptions.map(option => (
          <AutocompleteOption key={option} id={option} name={option}>
            {option}
          </AutocompleteOption>
        ))}
      </Autocomplete>
      <br />
      <span className="common-text">Search Text: {searchedText}</span>
      <br />
      <span className="common-text">Selected Item: {selectedValue?.value}</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Search item wrapper story
// ---------------------------------------------------------------------------

interface SearchItemOption {
  id: string;
  name: string;
  path: string[];
}

interface SearchItemWrapperProps {
  options: SearchItemOption[];
  onSelection?: (event: any) => void;
  onClearedSearchText?: () => void;
}

const SearchItemWrapper: React.FC<SearchItemWrapperProps> = ({
  options = [],
  onSelection,
  onClearedSearchText,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedValue, setSelectedValue] = useState<any>(null);

  const filteredOptions =
    searchText.length > 1
      ? options.filter(o => o.name.toLowerCase().includes(searchText.toLowerCase()))
      : [];

  return (
    <div style={{ maxWidth: '700px', minWidth: '200px' }}>
      <Autocomplete
        value={searchText}
        onChange={setSearchText}
        onOptionSelected={event => {
          setSelectedValue(event);
          onSelection?.(event);
        }}
        onClearedSearchText={() => {
          setSearchText('');
          onClearedSearchText?.();
        }}
        minimumSearchTextLength={2}
        ariaLabel="Search items with custom template"
      >
        {filteredOptions.map(option => (
          <AutocompleteOption key={option.id} id={option.id} name={option.name}>
            <SearchAutocompleteItem
              text={option.name}
              path={option.path.join('/')}
              searchText={searchText}
            />
          </AutocompleteOption>
        ))}
      </Autocomplete>
      <br />
      <span className="common-text">Search Text: {searchText}</span>
      <br />
      <span className="common-text">Selected Item: {selectedValue?.value}</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Mock backend search wrapper
// ---------------------------------------------------------------------------

interface MockBackendWrapperProps {
  options: string[];
  onSelection?: (event: any) => void;
  onClearedSearchText?: () => void;
}

const MockBackendWrapper: React.FC<MockBackendWrapperProps> = ({
  options = [],
  onSelection,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedValue, setSelectedValue] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);

  const handleChange = (value: string) => {
    setSearchText(value);
    if (value.length > 2) {
      setLoading(true);
      setFilteredOptions([]);
      // Simulate 5-second backend delay
      setTimeout(() => {
        const results = options.filter(o => o.toLowerCase().includes(value.toLowerCase()));
        setFilteredOptions(results);
        setLoading(false);
      }, 5000);
    } else {
      setFilteredOptions([]);
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '300px' }}>
      <Autocomplete
        value={searchText}
        onChange={handleChange}
        onOptionSelected={event => {
          setSelectedValue(event);
          onSelection?.(event);
        }}
        minimumSearchTextLength={3}
        placeholder="Search for item"
        ariaLabel="Search items with backend loading"
      >
        {loading && (
          <AutocompleteOption id="loading" name="loading" disabled>
            <span>Loading…</span>
          </AutocompleteOption>
        )}
        {!loading && filteredOptions.map(option => (
          <AutocompleteOption key={option} id={option} name={option}>
            {option}
          </AutocompleteOption>
        ))}
      </Autocomplete>
      <br />
      <span className="common-text">Search Text: {searchText}</span>
      <br />
      <span className="common-text">Selected Item: {selectedValue?.value}</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

interface StoryArgs {
  options: any[];
  onSelection?: (event: any) => void;
  onClearedSearchText?: () => void;
}

const meta: Meta<StoryArgs> = {
  title: 'Components/Autocomplete/Examples',
};

export default meta;

type Story = StoryObj<StoryArgs>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const AutocompleteBottomPosition: Story = {
  name: 'Autocomplete Bottom Position',
  render: args => (
    <div style={{ maxWidth: '600px', width: '100%' }}>
      <main>
        <header className="sol-screenreader-only"><h1>AutoComplete Bottom Position</h1></header>
        <div style={{ display: 'flex', padding: '24px', alignItems: 'flex-end', columnGap: '10px', height: 'calc(100vh - 180px)' }}>
          <NgModelWrapper
            options={args.options}
            onSelection={args.onSelection}
            onClearedSearchText={args.onClearedSearchText}
          />
        </div>
      </main>
    </div>
  ),
  args: {
    options: options1000,
  },
};

export const AutocompleteWithSearchItem: Story = {
  name: 'Autocomplete With Custom Template',
  render: args => (
    <div style={{ maxWidth: '600px', width: '100%' }}>
      <main>
        <header className="sol-screenreader-only"><h1>Autocomplete With Custom Template</h1></header>
        <SearchItemWrapper
          options={args.options}
          onSelection={args.onSelection}
          onClearedSearchText={args.onClearedSearchText}
        />
      </main>
    </div>
  ),
  args: {
    options: [
      { id: 'e0c9346d-5a78-4196-8cec-c56b14e83ac9', name: 'Kingdoms', path: [] },
      { id: 'd48f03ae-1221-4e39-8b86-5d1775e3a3fd', name: 'Thuboudour', path: ['Kingdoms'] },
      { id: 'be02ab36-fae4-4a92-84b3-3fe500bd3f07', name: 'Pebbailan', path: ['Kingdoms', 'Slecuryn'] },
      { id: 'f1d8457e-6b89-5287-9dfd-d67a03d71bd8', name: 'Robert Fox', path: ['Bank of America', 'Robert Fox'] },
      { id: 'g0c7356d-d6a78-5147-1afa-a63b91h52ad9', name: 'Leslie Alexandert', path: ['Robert Fox', 'Floyd Miles', 'Leslie Alexandert'] },
      { id: 'e39g12bd-2332-5f48-9c97-6e2886f54gg', name: 'Darlene Robertson', path: ['Robert Fox', 'Floyd Miles', 'Leslie Alexandert', 'Devon Lane', 'Jerome Bell', 'Darlene Robertson'] },
      { id: 'ad13bc47-gbf5-5b81-95c4-4gf611ce4g18', name: 'Jane Coopert', path: ['Robert Fox', 'Floyd Miles', 'Leslie Alexandert', 'Devon Lane', 'Jane Coopert'] },
      { id: 'ce03cd36-gbf5-4a83-94b4-4ge500bd4f08', name: 'Hertesa Webb', path: ['Bank Of America', 'Robert Fox_1', 'Robert Fox_2', 'Robert Fox_3', 'Robert Fox_4', 'Robert Fox_5', 'Robert Fox_6', 'Robert Fox_7'] },
    ],
  },
};

export const AutocompleteMockBackendSearch: Story = {
  name: 'Autocomplete With Mock Backend Search',
  render: args => (
    <div style={{ maxWidth: '600px', width: '100%' }}>
      <main>
        <header className="sol-screenreader-only"><h1>AutoComplete With Mock Backend Search</h1></header>
        <MockBackendWrapper
          options={args.options}
          onSelection={args.onSelection}
          onClearedSearchText={args.onClearedSearchText}
        />
      </main>
    </div>
  ),
  args: {
    options: options1000,
  },
};
