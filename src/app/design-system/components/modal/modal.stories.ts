import type { Meta, StoryObj } from '@storybook/angular';
import { ModalComponent } from './modal.component';

const meta: Meta<ModalComponent> = {
  title: 'Design System/Components/Modal',
  component: ModalComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<ModalComponent>;

export const Open: Story = {
  args: { open: true, title: 'Example Dialog' },
  render: (args) => ({
    props: args,
    template: `
      <ds-modal [open]="open" [title]="title">
        <p style="color: white">This is the modal body content.</p>
      </ds-modal>
    `,
  }),
};
