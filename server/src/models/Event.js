import mongoose from 'mongoose';

const coordinatesSchema = new mongoose.Schema(
  {
    x: {
      type: Number,
      required: true,
      min: [0, 'Coordinate x must be non-negative'],
      validate: {
        validator: (v) => Number.isFinite(v),
        message: 'Coordinate x must be a finite number'
      }
    },
    y: {
      type: Number,
      required: true,
      min: [0, 'Coordinate y must be non-negative'],
      validate: {
        validator: (v) => Number.isFinite(v),
        message: 'Coordinate y must be a finite number'
      }
    }
  },
  { _id: false }
);

const viewportSchema = new mongoose.Schema(
  {
    width: {
      type: Number,
      min: 0,
      validate: {
        validator: (v) => v === undefined || Number.isFinite(v),
        message: 'Viewport width must be a finite number'
      }
    },
    height: {
      type: Number,
      min: 0,
      validate: {
        validator: (v) => v === undefined || Number.isFinite(v),
        message: 'Viewport height must be a finite number'
      }
    }
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    session_id: {
      type: String,
      required: [true, 'session_id is required'],
      trim: true,
      minlength: [1, 'session_id cannot be empty'],
      index: true
    },
    event_type: {
      type: String,
      required: [true, 'event_type is required'],
      enum: {
        values: ['page_view', 'click'],
        message: 'event_type must be either "page_view" or "click"'
      },
      index: true
    },
    page_url: {
      type: String,
      required: [true, 'page_url is required'],
      trim: true,
      minlength: [1, 'page_url cannot be empty'],
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: [true, 'timestamp is required'],
      validate: {
        validator: (v) => v instanceof Date && !isNaN(v.getTime()),
        message: 'timestamp must be a valid date'
      },
      index: true
    },
    coordinates: {
      type: coordinatesSchema,
      required: false,
      validate: {
        validator: function (val) {
          if (this.event_type === 'click') {
            return val !== null && val !== undefined && typeof val.x === 'number' && typeof val.y === 'number';
          }
          return true;
        },
        message: 'Click events must include valid x and y coordinates'
      }
    },
    viewport: {
      type: viewportSchema,
      required: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound indexes for optimal aggregation and filtering performance
eventSchema.index({ session_id: 1, timestamp: 1 });
eventSchema.index({ page_url: 1, event_type: 1 });
eventSchema.index({ timestamp: -1 });

// Ensure click events always have coordinates
eventSchema.pre('validate', function (next) {
  if (this.event_type === 'click') {
    if (
      !this.coordinates ||
      this.coordinates.x === undefined ||
      this.coordinates.x === null ||
      this.coordinates.y === undefined ||
      this.coordinates.y === null ||
      !Number.isFinite(this.coordinates.x) ||
      !Number.isFinite(this.coordinates.y)
    ) {
      this.invalidate('coordinates', 'Click events must include valid x and y coordinates');
    }
  }
  next();
});

export const Event = mongoose.model('Event', eventSchema);
