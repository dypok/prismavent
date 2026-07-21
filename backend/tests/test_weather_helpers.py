import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.weather_service import _forecast_unavailable, _parse_forecast_response


class TestWeatherHelpers(unittest.TestCase):
    def test_forecast_unavailable_returns_message(self):
        result = _forecast_unavailable("Custom message")
        self.assertEqual(result["message"], "Custom message")

    def test_forecast_unavailable_all_none(self):
        result = _forecast_unavailable("any")
        self.assertIsNone(result["temp"])
        self.assertIsNone(result["condition"])
        self.assertIsNone(result["description"])
        self.assertIsNone(result["icon"])

    def test_parse_forecast_full(self):
        forecast = {"main": {"temp": 25.5}, "weather": [{"main": "Clear", "description": "cielo claro", "icon": "01d"}]}
        result = _parse_forecast_response(forecast)
        self.assertEqual(result["temp"], 25.5)
        self.assertEqual(result["condition"], "Clear")
        self.assertEqual(result["description"], "cielo claro")
        self.assertEqual(result["icon"], "01d")
        self.assertEqual(result["message"], "Forecast available")

    def test_parse_forecast_no_weather_array(self):
        forecast = {"main": {"temp": 30.0}, "weather": []}
        result = _parse_forecast_response(forecast)
        self.assertEqual(result["temp"], 30.0)
        self.assertIsNone(result["condition"])
        self.assertIsNone(result["description"])
        self.assertIsNone(result["icon"])

    def test_parse_forecast_empty(self):
        result = _parse_forecast_response({})
        self.assertIsNone(result["temp"])
        self.assertIsNone(result["condition"])


if __name__ == "__main__":
    unittest.main()
