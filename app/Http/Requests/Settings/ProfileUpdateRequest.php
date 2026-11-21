<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use App\Support\PhilippineLocalityDirectory;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...$this->profileRules($this->user()->id),
            'bio' => ['nullable', 'string', 'max:500'],
            'locality_code' => [
                'nullable',
                'string',
                'regex:/^[0-9]{10}$/',
                Rule::in(
                    app(PhilippineLocalityDirectory::class)->codes()
                ),
            ],
        ];
    }
}
