import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Design System/Primitives/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-button [variant]="variant" [size]="size">Pick a movie</ds-button>`,
  }),
  args: { variant: 'primary', size: 'md' },
};

export const Secondary: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-button [variant]="variant" [size]="size">Already seen</ds-button>`,
  }),
  args: { variant: 'secondary', size: 'md' },
};

export const Ghost: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-button [variant]="variant" [size]="size">Cancel</ds-button>`,
  }),
  args: { variant: 'ghost', size: 'md' },
};

export const Disabled: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-button [variant]="variant" [disabled]="disabled">Unavailable</ds-button>`,
  }),
  args: { variant: 'primary', disabled: true },
};

export const Small: Story = {
  render: () => ({ template: `<ds-button variant="primary" size="sm">Small</ds-button>` }),
};

export const Large: Story = {
  render: () => ({ template: `<ds-button variant="primary" size="lg">Large</ds-button>` }),
};
