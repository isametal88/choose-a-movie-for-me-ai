import type { Meta, StoryObj } from '@storybook/angular';
import { ContainerComponent } from './container.component';

const meta: Meta<ContainerComponent> = {
  title: 'Design System/Layout/Container',
  component: ContainerComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<ContainerComponent>;

export const XL: Story = {
  args: { size: 'xl' },
  render: (args) => ({
    props: args,
    template: `<ds-container [size]="size" style="background: #1f2937; color: white; padding-block: 1rem">Max-width XL container</ds-container>`,
  }),
};

export const MD: Story = {
  args: { size: 'md' },
  render: (args) => ({
    props: args,
    template: `<ds-container [size]="size" style="background: #1f2937; color: white; padding-block: 1rem">Max-width MD container</ds-container>`,
  }),
};
