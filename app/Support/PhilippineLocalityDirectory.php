<?php

namespace App\Support;

final class PhilippineLocalityDirectory
{
    public function all(): array
    {
        return json_decode(
            file_get_contents(
                resource_path('data/philippine-cities.json')
            ),
            true,
            512,
            JSON_THROW_ON_ERROR
        );
    }

    public function codes(): array
    {
        return array_column($this->all(), 'code');
    }

    public function search(string $query, int $limit = 10): array
    {
        $matches = array_filter(
            $this->all(),
            fn (array $city): bool => mb_stripos($city['name'], $query) !== false
        );

        return array_slice(array_values($matches), 0, $limit);
    }

    public function find(string $code): ?array
    {
        foreach ($this->all() as $city) {
            if ($city['code'] === $code) {
                return $city;
            }
        }

        return null;
    }
}
